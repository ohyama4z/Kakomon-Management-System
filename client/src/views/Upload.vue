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
            placeholder="ブランチ名を入力"
            v-model="branchName"
          />
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
        v-for="[filename, blobUri] in Object.entries(uploadedFiles)"
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

      <div class="uk-text-center@s uk-margin">
        <div v-if="!branchName">ブランチ名を入力してください</div>
        <div v-if="Object.keys(uploadedFiles).length < 1">
          1つ以上ファイルを選択してください
        </div>
      </div>

      <div class="uk-flex uk-flex-center uk-margin">
        <vk-button
          type="primary"
          class="uk-margin"
          v-bind:disabled="Object.keys(uploadedFiles).length < 1 || !branchName"
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
      branchName: ''
    }
  },
  mounted() {
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

    logout() {
      localStorage.setItem('lastPage', 'upload')
      this.$store.commit('updateLastPage')
      this.$router.push('/logout')
    },

    async uploadNewFile() {
      console.log({ files: this.uploadedFiles, branch: this.branchName })
    },

    dropFile() {
      const droppedFiles = event.target.files || event.dataTransfer.files
      console.log(droppedFiles)
      Object.values(droppedFiles).map(file => {
        const blobUri = URL.createObjectURL(file)
        this.uploadedFiles = {
          ...this.uploadedFiles,
          [file.name]: blobUri
        }
      })
      console.log(this.uploadedFiles)
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
