<template>
  <div>
    <Navbar></Navbar>

    <vk-spinner
      class="uk-position-medium uk-position-center"
      ratio="5"
      v-if="isLoading"
    ></vk-spinner>

    <div v-if="!isLoading">
      <Sidebar></Sidebar>
      <div class="forms" v-bind:class="{ expand: expand }">
        <div class="uk-margin uk-flex uk-flex-center">
          <input
            class="uk-input uk-form-width-medium"
            type="text"
            placeholder="教科名を入力"
            v-model="subject"
          />
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
          <select class="uk-select uk-form-width-medium" v-model="contentType">
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
          <select class="uk-select uk-form-width-medium" v-model="contentType">
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

        <div class="uk-text-center@s uk-margin" v-if="!isSellectedAll">
          すべての項目を選択してください
        </div>

        <div class="uk-flex uk-flex-center uk-margin">
          <vk-button
            type="primary"
            class="uk-margin"
            v-bind:disabled="!isSellectedAll"
            v-on:click="updateEditData"
            >編集をコミット</vk-button
          >
        </div>

        <div class="uk-flex uk-flex-center uk-margin">
          <vk-button type="primary" class="uk-margin" v-on:click="postCommitCsv"
            >コミット</vk-button
          >
        </div>
        <Preview></Preview>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Button } from 'vuikit/lib/button'
import { Spinner } from 'vuikit/lib/spinner'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Preview from '../components/Preview'

export default {
  name: 'Edit',

  components: {
    VkSpinner: Spinner,
    VkButton: Button,
    Sidebar,
    Navbar,
    Preview
  },

  data() {
    return {
      subject: '',
      year: null,
      toolType: '',
      period: '',
      contentType: '',
      author: '',
      selectedBranch: 'master',
      editType: ''
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
    ...mapState({
      isLoading: state => {
        const checkLoading = status => {
          return status === 'loading'
        }

        return (
          checkLoading(state.branches.status) ||
          checkLoading(state.commits[state.currentBranch]?.status)
        )
      },

      expand: state => state.expand
    }),

    isSellectedAll() {
      return (
        this.subject &&
        this.year &&
        this.toolType &&
        this.period &&
        this.contentType &&
        this.author
      )
    }
  },

  methods: {
    async getCommit() {
      const commitSha = this.$store.state.branches.data[this.selectedBranch]
      await this.$store.dispatch('getCommit', commitSha)
    },
    async postCommitCsv() {
      await this.$store.dispatch('postCommitCsv')
    },

    updateEditData() {
      const changedFiles = {
        subj: this.subject,
        year: this.year,
        tool_type: this.toolType,
        period: this.period,
        content_type: this.contentType,
        author: this.author
      }
      this.$store.commit('setChangedFiles', changedFiles)
    }
  }
}
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
</style>
