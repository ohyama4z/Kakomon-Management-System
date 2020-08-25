<template>
  <div>
    <Navbar></Navbar>
    <div class="forms">
      <div class="uk-margin uk-flex uk-flex-center">
        <div class="uk-inline">
          <vk-icon icon="git-branch" class="uk-form-icon" />
          <input
            class="uk-input uk-form-width-medium"
            type="text"
            placeholder="ブランチを検索"
            v-model="branchName"
            list="branchList"
          />
          <datalist id="branchList">
            <option
              v-for="(sha, branchName) in branches"
              v-bind:key="sha"
              v-show="branchName !== 'master'"
              >{{ branchName }}</option
            >
          </datalist>
        </div>
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
            @click="trashFile(filename)"
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
        <div v-if="branchName === 'master'">master branchは選択できません</div>
        <div v-if="Object.keys(uploadedFiles).length < 1">
          1つ以上ファイルを選択してください
        </div>
      </div>

      <div class="uk-flex uk-flex-center uk-margin">
        <vk-button
          type="primary"
          class="uk-margin"
          v-bind:disabled="
            Object.keys(uploadedFiles).length < 1 ||
            !branchName ||
            branchName === 'master'
          "
          v-on:click="uploadNewFile()"
          >アップロード</vk-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from 'vuikit/lib/button'
import { Icon } from 'vuikit/lib/icon'
import { Iconnav, IconnavItem } from 'vuikit/lib/iconnav'
import Navbar from '../components/Navbar'
import { mapState } from 'vuex'

export default {
  name: 'Upload',
  components: {
    VkButton: Button,
    VkIcon: Icon,
    VkIconnav: Iconnav,
    VkIconnavItem: IconnavItem,
    Navbar
  },

  data() {
    return {
      uploadedFiles: {},
      branchName: '',
      commitMessage: ''
    }
  },
  async mounted() {
    if (this.$store.state.currentUser == null) {
      localStorage.setItem('lastPage', 'upload')
      this.$store.commit('updateLastPage')
      this.$router.push('/login')
    }
    await this.$store.dispatch('getBranches')
  },
  computed: {
    ...mapState({
      branches: state => {
        const { master, ...branches } = state.branches.data
        return branches
      }
    })
  },
  methods: {
    toEdit() {
      this.$router.push('edit')
    },

    logout() {
      localStorage.setItem('lastPage', 'upload')
      this.$store.commit('updateLastPage')
      this.$router.push('/logout')
    },

    async uploadNewFile() {
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

    dropFile() {
      const droppedFiles = event.target.files || event.dataTransfer.files
      Object.values(droppedFiles).map(file => {
        const blobUri = URL.createObjectURL(file)
        this.uploadedFiles = {
          ...this.uploadedFiles,
          [file.name]: blobUri
        }
      })
    },

    trashFile(filename) {
      const { [filename]: omit, ...newFilesObj } = this.uploadedFiles
      this.uploadedFiles = newFilesObj
    }
  }
}
</script>

<style scoped>
.forms {
  padding-top: 10vh;
}
</style>
