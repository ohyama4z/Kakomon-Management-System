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
      <div class="forms" v-bind:class="{ collapsed: collapase }">
        <!-- <div
            class="uk-position-medium uk-position-top-right uk-overlay uk-overlay-default"
          >
            <div class="uk-text-center@s uk-margin">
              編集するブランチを選択してください。
            </div>

            <div class="uk-margin uk-flex uk-flex-center">
              <select
                class="uk-select uk-form-width-medium"
                v-model="selectedBranch"
                @change="selectBranch"
              >
                <option disabled value="">ブランチを選択</option>
                <option>master</option>
                <option
                  v-for="(sha, branchName) in branches"
                  v-bind:key="sha"
                  v-show="branchName !== 'master'"
                  >{{ branchName }}</option
                >
              </select>
            </div>
          </div> -->

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

        <div
          class="uk-text-center@s uk-margin"
          v-for="file in selectedFiles"
          v-bind:key="file.title"
        >
          {{ file.title }}
          <button @click="trashFile(file)">削除</button>
        </div>
      </div>
    </div>

    <div
      class="uk-position-bottom uk-overlay uk-overlay-default uk-text-center"
    >
      ※過去問編集フォームの使い方がわからない場合は、
      <a
        class="uk-link-toggle"
        href="https://github.com/asann3/Kakomon-Management-System/blob/master/client/manuals/README.md"
        target="_blank"
      >
        README.md
      </a>
      を参照してください。
    </div>

    <div
      class="uk-position-medium uk-position-bottom-right uk-overlay uk-overlay-default"
    >
      <div v-if="!isLoading">
        <button class="uk-button uk-button-link" v-on:click="toUpload">
          アップロード画面へ
          <vk-icon icon="chevron-right"></vk-icon>
        </button>
      </div>
      <div>
        <button class="uk-button uk-button-link" v-on:click="logout">
          ログアウト
          <vk-icon icon="chevron-right"></vk-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default {
  name: 'edit',

  components: {
    Sidebar,
    Navbar
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
    if (this.$store.state.currentUser == null) {
      localStorage.setItem('lastPage', 'edit')
      this.$store.commit('updateLastPage')
      this.$router.push('/login')
    }
    await this.$store.dispatch('getBranches')
    await this.$store.dispatch('selectBranch', this.selectedBranch)
    this.getCommit()
    // this.setCommitCSV()
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

      branches: state => state.branches.data,
      collapase: state => state.collapased
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
    toUpload() {
      this.$router.push('upload')
    },

    logout() {
      localStorage.setItem('lastPage', 'edit')
      this.$store.commit('updateLastPage')
      this.$router.push('/logout')
    },

    async getCommit() {
      const commitSha = this.$store.state.branches.data[this.selectedBranch]
      await this.$store.dispatch('getCommit', commitSha)
    },

    async selectBranch() {
      await this.$store.dispatch('selectBranch', this.selectedBranch)
    },

    // setCommitCSV() {
    //   this.$store.dispatch('setCommitCSV', this.selectedBranch)
    // },
    trashFile(file) {
      const index = this.selectedFiles.findIndex(
        item => item.title === file.title
      )
      this.selectedFiles.splice(index, 1)
    },

    updateEditData() {
      // sendObjは1つのcsvfile
      const sendObj = {
        selecteBranch: this.selectedBranch,
        selectedFiles: this.selectedFiles,
        subject: this.subject,
        year: this.year,
        toolType: this.toolType,
        period: this.period,
        contentType: this.contentType,
        author: this.author
      }

      this.$store.dispatch('updateEditData', sendObj)
    }
  }
}
</script>

<style>
@import url('https://use.fontawesome.com/releases/v5.6.1/css/all.css');
.forms {
  padding-top: 50px;
}
.collapsed {
  padding-left: 350px;
}
</style>
