<template>
  <div>
    <div></div>
    <h1 class="uk-text-center@s">過去問アップロードフォーム</h1>

    <div class="uk-margin uk-flex uk-flex-center">
      <input
        class="uk-input uk-form-width-medium"
        type="text"
        placeholder="ブランチ名を入力"
        v-model="branchName"
      />
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
      class="uk-text-center@s"
      v-for="file in uploadedFiles"
      v-bind:key="file.fileData.lastModified"
    >
      {{ file.fileData.name }}
    </div>

    <div class="uk-text-center@s uk-margin" v-if="!branchName">
      <div>ブランチ名を入力してください</div>
    </div>

    <div class="uk-flex uk-flex-center uk-margin">
      <vk-button
        type="primary"
        class="uk-margin"
        v-bind:disabled="uploadedFiles.length < 1 && !branchName"
        v-on:click="uploadNewFile()"
        >アップロード</vk-button
      >
    </div>

    <div
      class="uk-position-bottom uk-overlay uk-overlay-default uk-text-center"
    >
      ※過去問アップロードフォームの使い方がわからない場合は、
      <a
        class="uk-link-toggle"
        href="https://github.com/asann3/Kakomon-Management-System/blob/master/client/manuals/README.md"
        target="_blank"
      >
        README.md
      </a>
      を参照してください。
    </div>

    <div class="uk-position-medium uk-position-bottom-right uk-overlay uk-overlay-default">
      <div v-if="!isLoading">
        <button class="uk-button uk-button-link" v-on:click="toEdit">編集画面へ
          <vk-icon icon="chevron-right"></vk-icon>
        </button>
      </div>
      <div>
        <button class="uk-button uk-button-link" v-on:click="logout">ログアウト
        <vk-icon icon="chevron-right"></vk-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const netlifyIdentity = require('netlify-identity-widget')
export default {
  name: 'upload',
  data() {
    return {
      uploadedFiles: [],
      branchName: null
    }
  },
  mounted() {
    netlifyIdentity.on('logout', () => {
      localStorage.setItem('lastPage', 'upload')
      this.$store.commit('updateLastPage')
      this.$router.push('/login')
    })

    if (this.$store.state.currentUser == null) {
      localStorage.setItem('lastPage', 'upload')
      this.$store.commit('updateLastPage')
      this.$router.push('/login')
    }
  },
  computed: {},
  methods: {
    toEdit() {
      this.$router.push('edit')
    },

      logout () {
        localStorage.setItem('lastPage', 'upload')
        this.$store.commit('updateLastPage')
        this.$router.push('/logout')
      },

      async uploadNewFile () {
        await this.$store.dispatch('upload', this.uploadedFiles)
        this.$store.state.files.forEach(file => {
          console.log(file)
        })
      },

    dropFile(event) {
      const droppedFile = event.target.files || event.dataTransfer.files
      const url = URL.createObjectURL(droppedFile[0])
      this.uploadedFiles.push({ fileData: droppedFile[0], url })
    }
  }
}
</script>
