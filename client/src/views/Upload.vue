<template>
  <div>
    <Navbar v-on:before-logout="logout"></Navbar>

    <vk-spinner
      class="uk-position-medium uk-position-center"
      ratio="5"
      v-if="isLoading"
    ></vk-spinner>

    <div class="forms" v-if="!isLoading">
      <div class="uk-margin uk-flex uk-flex-center">
        <vk-icon icon="git-branch"></vk-icon>
        <span v-if="branchName"> : {{ branchName }}</span>
        <span v-else> : 選択されていません</span>
      </div>

      <div class="uk-margin uk-flex uk-flex-center">
        <vk-button>ブランチを選択</vk-button>
        <vk-drop mode="click" positon="bottom-justify">
          <vk-card padding="small">
            <div class="uk-flex uk-flex-column">
              <div class="uk-margin-auto uk-inline">
                <vk-icon icon="git-branch" class="uk-form-icon" />
                <input
                  class="uk-input uk-form-width-medium"
                  type="text"
                  placeholder="ブランチを新規作成"
                  v-model="newBranch"
                />
                <vk-button
                  size="small"
                  type="primary"
                  :disabled="!isNewBranch"
                  @click="createBranch"
                  >作成</vk-button
                >
              </div>
              <div class="uk-text-center@s" v-if="isExisted">
                そのbranchはすでに存在します
              </div>

              <div class="uk-margin-top uk-flex uk-flex-column">
                <hr />
                <vk-button
                  type="text"
                  class="uk-inline uk-margin-small"
                  v-for="(sha, branchName) in branches"
                  v-bind:key="sha"
                  @click="selectExistedBranch(branchName)"
                >
                  {{ branchName }}
                </vk-button>
              </div>
            </div>
          </vk-card>
        </vk-drop>
      </div>

      <div class="uk-flex uk-flex-center uk-margin">
        <div
          class="drag-area uk-placeholder uk-text-center uk-form-width-large"
          @dragover.prevent
          @drop.prevent="dropFile"
        >
          <vk-icon icon="cloud-upload"></vk-icon>
          <span class="uk-text-middle">ファイルをドラック&ドロップ</span>
          <div uk-form-custom>
            <input
              type="file"
              accept="image/jpeg, image/png, image/jpg"
              @change="dropFile"
              multiple
            />
          </div>
        </div>
      </div>

      <div
        class="uk-flex uk-flex-center uk-margin-small"
        v-for="(blobUri, filename) in uploadedFiles"
        v-bind:key="blobUri"
      >
        <vk-iconnav>
          {{ filename }}
          <vk-iconnav-item
            @click="deleteFile(filename)"
            icon="trash"
          ></vk-iconnav-item>
        </vk-iconnav>
      </div>

      <div class="uk-margin uk-flex uk-flex-center">
        <div class="uk-inline">
          <vk-icon icon="pencil" class="uk-form-icon" />
          <input
            class="uk-input uk-form-width-medium"
            type="text"
            placeholder="コミットメッセージ"
            v-model="commitMessage"
          />
        </div>
      </div>

      <div class="uk-text-center@s uk-margin">
        <div v-if="!branchName">ブランチ名を入力してください</div>
        <div v-if="branchName === 'master'">
          master branchは選択できません
        </div>
        <div v-if="Object.keys(uploadedFiles).length < 1">
          1つ以上ファイルを選択してください
        </div>
        <div v-if="!commitMessage">コミットメッセージを入力してください</div>
      </div>

      <div class="uk-flex uk-flex-center uk-margin">
        <vk-button
          type="primary"
          class="uk-margin"
          v-bind:disabled="isDisabled"
          v-on:click="upload()"
          >アップロード</vk-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import { Button } from 'vuikit/lib/button'
// @ts-ignore
import { Icon } from 'vuikit/lib/icon'
// @ts-ignore
import { Spinner } from 'vuikit/lib/spinner'
// @ts-ignore
import { Iconnav, IconnavItem } from 'vuikit/lib/iconnav'
// @ts-ignore
import { Drop } from 'vuikit/lib/drop'
import Navbar from '../components/Navbar.vue'

import Vue from 'vue'
import { State } from '../store/state'

interface DataType {
  uploadedFiles: {
    [filename: string]: string
  }
  branchName: string
  commitMessage: string
  newBranch: string
}

export default Vue.extend({
  name: 'Upload',
  components: {
    VkButton: Button,
    VkIcon: Icon,
    VkIconnav: Iconnav,
    VkIconnavItem: IconnavItem,
    VkDrop: Drop,
    VkSpinner: Spinner,
    Navbar
  },

  data(): DataType {
    return {
      uploadedFiles: {},
      branchName: '',
      commitMessage: '',
      newBranch: ''
    }
  },
  mounted() {
    this.$store.dispatch('updateCurrentUser')
    if (this.$store.state.currentUser == null) {
      localStorage.setItem('lastPage', 'upload')
      this.$store.commit('updateLastPage')
      this.$router.push('/login')
    }
    this.$store.dispatch('getBranches')
  },
  computed: {
    branches(): any {
      const state = this.$store.state as State
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { master: _, ...branches } = state.branches.data
      return branches
    },

    isLoading(): boolean {
      // const state = this.$store.state as State
      const state = this.$store.state as State
      const checkLoading = (status: typeof state.branches.status) => {
        return status === 'loading'
      }

      return checkLoading(state.branches.status)
    },

    isDisabled(): boolean {
      return (
        Object.keys(this.uploadedFiles).length < 1 ||
        !this.branchName ||
        this.branchName === 'master' ||
        !this.commitMessage
      )
    },

    isExisted(): boolean {
      const isExieted = Object.keys(this.branches).reduce((p, branch) => {
        // 大文字,小文字を区別せず判定
        if (branch.toUpperCase() === this.newBranch.toUpperCase()) {
          p = true
        }
        return p
      }, false)
      return isExieted
    },

    isNewBranch(): boolean {
      return !this.isExisted && this.newBranch !== ''
    }
  },
  methods: {
    async upload(): Promise<void> {
      await this.$store.dispatch('upload', {
        files: this.uploadedFiles,
        branch: this.branchName,
        commitMessage: this.commitMessage
      })
      // 表面上のリセット
      this.uploadedFiles = {}
      this.branchName = ''
      this.commitMessage = ''
    },

    dropFile(event: any): void {
      const droppedFiles: any[] = event.target.files || event.dataTransfer.files
      Object.values(droppedFiles).map(file => {
        const blobUri = URL.createObjectURL(file)
        this.uploadedFiles = {
          ...this.uploadedFiles,
          [file.name]: blobUri
        }
      })
    },

    deleteFile(filename: string): void {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [filename]: _, ...newFilesObj } = this.uploadedFiles
      this.uploadedFiles = newFilesObj
    },

    selectExistedBranch(branchName: string): void {
      this.branchName = branchName
    },

    logout(): void {
      localStorage.setItem('lastPage', 'upload')
      this.$store.commit('updateLastPage')
    },

    async createBranch(): Promise<void> {
      await this.$store.dispatch('createBranch', this.newBranch)
      await this.$store.dispatch('getBranches')
      this.uploadedFiles = {}
      this.branchName = ''
      this.commitMessage = ''
      this.newBranch = ''
    }
  }
})
</script>

<style scoped>
.forms {
  padding-top: 10vh;
}
</style>
