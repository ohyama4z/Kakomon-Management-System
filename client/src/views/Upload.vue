<template>
  <div>
    <div></div>
    <h1 class="uk-text-center@s">過去問アップロードフォーム</h1>

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
          >
        </div>
      </div>
    </div>

    <div v-for="(file, index) in uploadedFiles" class="uk-text-center@s" v-bind:key="index">
      {{ file.name }}
    </div>

    <div class="uk-flex uk-flex-center uk-margin">
      <vk-button
        type="primary"
        class="uk-margin"
        v-bind:disabled="uploadedFiles.length<1"
        v-on:click="uploadNewFile()"
      >アップロード</vk-button>
    </div>

    <div class="uk-position-medium uk-position-top-right uk-overlay uk-overlay-default">
      <button class="uk-button uk-button-link" v-on:click="toEdit">編集画面へ
        <vk-icon icon="chevron-right"></vk-icon>
      </button>
    </div>
  </div>
</template>



<script>
  export default {
    name: 'upload',
    data () {
      return {
          uploadedFiles: []
      }
    },
    computed: {
    },
    methods: {
      toEdit () {
        this.$router.push('edit')
      },
      uploadNewFile () {
        this.$store.disapatch('uploadNewFile', this.uploadedFiles)
      },
      dropFile () {
        this.uploadedFiles.push([...event.dataTransfer.files])
        console.log('dorp on!')
      }
    }
  }
</script>
