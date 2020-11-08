<template>
  <div>
    <Navbar v-on:before-logout="logout"></Navbar>

    <vk-spinner
      class="uk-position-medium uk-position-center"
      ratio="5"
      v-if="isLoading"
    ></vk-spinner>

    <div v-if="!isLoading">
      <Sidebar></Sidebar>
      <div class="forms" v-bind:class="{ expand: expand, collapse: !expand }">
        <div class="uk-flex uk-flex-center">
          <vk-icon-button
            icon="thumbnails"
            @click="pushPreview"
            class="uk-margin-right"
            :class="{ pushed: displayMode === 'preview' }"
          ></vk-icon-button>
          <vk-icon-button
            icon="list"
            @click="pushList"
            :class="{ pushed: displayMode === 'list' }"
          ></vk-icon-button>
        </div>

        <div class="uk-margin-large-top" v-show="displayMode === 'list'">
          <List></List>
          <div v-show="isExistSelectedFile">
            <div class="uk-margin uk-flex uk-flex-center">
              <input
                class="uk-input uk-form-width-medium"
                type="text"
                placeholder="教科名を入力"
                v-model="subject"
                list="subjectList"
              />
              <datalist id="subjectList">
                <option v-for="subject in subjects" :key="subject">
                  {{ subject }}
                </option>
              </datalist>
            </div>

            <div class="uk-margin uk-flex uk-flex-center">
              <input
                class="uk-input uk-form-width-medium"
                type="number"
                placeholder="年度を入力(西暦)"
                v-model="year"
              />
            </div>

            <div class="uk-margin uk-flex uk-flex-center">
              <select class="uk-select uk-form-width-medium" v-model="toolType">
                <option disabled value="">用途を選択</option>
                <option>勉強用</option>
                <option>テスト</option>
              </select>
            </div>

            <div class="uk-margin uk-flex uk-flex-center">
              <select class="uk-select uk-form-width-medium" v-model="period">
                <option disabled value="">テストの時期を選択</option>
                <option>前期中間</option>
                <option>前期定期</option>
                <option>後期中間</option>
                <option>後期定期</option>
              </select>
            </div>

            <div
              class="uk-margin uk-flex uk-flex-center"
              v-if="toolType === 'テスト'"
            >
              <select
                class="uk-select uk-form-width-medium"
                v-model="contentType"
              >
                <option disabled value="">用紙の種類を選択</option>
                <option>問題</option>
                <option>解答なし答案用紙</option>
                <option>学生解答</option>
                <option>模範解答</option>
              </select>
            </div>

            <div
              class="uk-margin uk-flex uk-flex-center"
              v-if="toolType === '勉強用'"
            >
              <select
                class="uk-select uk-form-width-medium"
                v-model="contentType"
              >
                <option disabled value="">用紙の種類を選択</option>
                <option>ノート</option>
                <option>まとめ</option>
                <option>対策プリント</option>
              </select>
            </div>

            <div class="uk-margin uk-flex uk-flex-center">
              <input
                class="uk-input uk-form-width-medium"
                type="text"
                placeholder="用紙作成者,担当教員"
                v-model="author"
              />
            </div>

            <div class="uk-text-center uk-margin" v-if="!isSellectedAll">
              すべての項目を選択してください
            </div>

            <div class="uk-flex uk-flex-center uk-margin">
              <vk-button
                type="primary"
                class="uk-margin"
                v-bind:disabled="!isSellectedAll"
                v-on:click="updateEditData"
                >編集内容を反映</vk-button
              >
            </div>
          </div>
          <div
            class="uk-flex uk-flex-center uk-margin"
            v-show="isExistChangedFiles"
          >
            <vk-button-link type="primary" class="uk-margin" @click="openModal"
              >コミット</vk-button-link
            >

            <vk-modal center :show="isModalOpened">
              <vk-modal-close @click="closeModal"></vk-modal-close>
              <p>
                編集内容をコミットします。よろしいですか?
              </p>
              <p class="uk-text-right">
                <vk-button
                  @click="closeModal"
                  size="small"
                  class="uk-margin-small-right"
                  type="primary"
                >
                  キャンセル
                </vk-button>
                <vk-button size="small" @click="postCommitCsv">
                  はい
                </vk-button>
              </p>
            </vk-modal>
          </div>
        </div>
        <Preview v-show="displayMode === 'preview'"></Preview>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters } from 'vuex'
import 'vuikit'
import { State } from '../store/state'
// @ts-ignore
import { Button, ButtonLink } from 'vuikit/lib/button'
// @ts-ignore
import { Spinner } from 'vuikit/lib/spinner'
// @ts-ignore
import { IconButton } from 'vuikit/lib/icon'
// @ts-ignore
import { Modal } from 'vuikit/lib/modal'

import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import Preview from '../components/Preview.vue'
import List from '../components/List.vue'

import Vue from 'vue'

import { StateTypedVueConstructor } from '../extended'

interface Data {
  subject: string
  year: string | null
  toolType: string
  period: string
  contentType: string
  author: string
  selectedBranch: string
  editType: string
  displayMode: 'preview' | 'list'
  isModalOpened: boolean
}
export default (Vue as StateTypedVueConstructor).extend({
  name: 'Edit',

  components: {
    VkSpinner: Spinner,
    VkButton: Button,
    VkIconButton: IconButton,
    VkButtonLink: ButtonLink,
    VkModal: Modal,
    Sidebar,
    Navbar,
    Preview,
    List
  },

  data(): Data {
    return {
      subject: '',
      year: null,
      toolType: '',
      period: '',
      contentType: '',
      author: '',
      selectedBranch: 'master',
      editType: '',
      displayMode: 'list',
      isModalOpened: false
    }
  },

  async mounted() {
    this.$store.dispatch('updateCurrentUser')
    if (this.$store.state.currentUser == null) {
      localStorage.setItem('lastPage', 'edit')
      this.$store.commit('updateLastPage')
      this.$router.push('/login')
    }
    await this.$store.dispatch('getBranches')
    await this.$store.dispatch('selectBranch', this.selectedBranch)
    this.getCommit()
  },

  computed: {
    ...mapGetters(['subjects']),

    isLoadingFiles(): boolean {
      const state = this.$store.state as State
      const checkLoading = (status: string) => {
        return status === 'loading'
      }

      return (
        checkLoading(state.branches.status) ||
        checkLoading(state.commits[state.currentBranch]?.status) ||
        checkLoading(state.commitStatus)
      )
    },

    expand(): boolean {
      const state = this.$store.state as State
      return state.expand
    },

    isLoading(): boolean {
      const checkLoading = (status: string) => {
        return status === 'loading'
      }

      return (
        this.isLoadingFiles ||
        checkLoading(this.$store.getters.currentBranchMetadatas.status)
      )
    },

    isSellectedAll(): boolean {
      return (
        !!this.subject &&
        !!this.year &&
        !!this.toolType &&
        !!this.period &&
        !!this.contentType &&
        !!this.author
      )
    },

    isExistSelectedFile(): boolean {
      const state = this.$store.state as State
      return state.selectedFiles.length > 0
    },

    isExistChangedFiles() {
      const state = this.$store.state as State
      return Object.keys(state.changedFiles).length > 0
    }
  },

  methods: {
    async getCommit(): Promise<void> {
      const commitSha = this.$store.state.branches.data[this.selectedBranch]
      await this.$store.dispatch('getCommit', commitSha)
    },
    async postCommitCsv(): Promise<void> {
      await this.$store.dispatch('postCommitCsv')
      this.clearFormAndCloseModal()
    },

    logout(): void {
      localStorage.setItem('lastPage', 'edit')
      this.$store.commit('updateLastPage')
    },

    updateEditData(): void {
      const changedFiles = {
        subj: this.subject,
        year: this.year,
        tool_type: this.toolType,
        period: this.period,
        content_type: this.contentType,
        author: this.author
      }
      this.$store.commit('setChangedFiles', changedFiles)
    },

    pushPreview(): void {
      this.displayMode = 'preview'
    },

    pushList(): void {
      this.displayMode = 'list'
    },

    openModal(): void {
      this.isModalOpened = true
    },

    closeModal(): void {
      this.isModalOpened = false
    },

    clearFormAndCloseModal(): void {
      this.$store.commit('clearChangedFilesAndSelectedFiles')
      this.isModalOpened = false
    }
  }
})
</script>

<style>
@import url('https://use.fontawesome.com/releases/v5.6.1/css/all.css');
</style>
<style scoped>
.forms {
  padding-top: 10vh;
}
.expand {
  padding-left: 350px;
}
.collapse {
  padding-left: 50px;
}
.pushed {
  color: white;
  background-color: #39f;
}
</style>
