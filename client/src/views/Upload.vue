<template>
  <div>
    <div></div>
    <h1 class="uk-text-center@s">過去問アップロードフォーム</h1>

    <!-- ファイルドラック&ドロップの処理は出来てない -->
    <div class="uk-flex uk-flex-center uk-margin">
      <div 
        class="drag-area uk-placeholder uk-text-center uk-form-width-large"
        @dragover.prevent
        @drop.prevent="dropFile"
      >
        <vk-icon icon="cloud-upload"></vk-icon>
        <span class="uk-text-middle">ファイルをドラック&ドロップ</span>
        <div uk-form-custom>
          <!-- この<input>をどうすればいいかわからん -->
          <input
            type="file"
            accept="image/jpeg, image/png, image/jpg"
            @change="dropFile"
            multiple
          >
        </div>
      </div>
    </div>

    <!-- <div v-for="file in file.name" class="uk-text-center@s" v-bind:key="file.id">
      {{ file.name }}
    </div>
 -->
    <div class="uk-flex uk-flex-center uk-margin">
      <vk-button
        type="primary"
        class="uk-margin"
        v-bind:disabled="files.length<1"
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
          files: []
      }
    },
    computed: {
    },
    methods: {
      toEdit () {
        this.$router.push('edit')
      },
      uploadNewFile () {
        this.$store.disapatch('uploadNewFile', this.files)
      },
      dropFile (event) {
        const images = event.target.images || event.dataTransfer.images;
        this.createImage(images[0]);
        this.files.push({name: images[0].name});
        this.$emit("upload", images);
      } 
    }
  }
</script>
