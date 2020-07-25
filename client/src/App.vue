<template>
  <div id="app">

    <h1 class="uk-text-center@s">過去問アップロードフォーム</h1>
    <div class="uk-margin uk-flex uk-flex-center">
      <input
        class="uk-input uk-form-width-medium"
        type="text"
        placeholder="教科名を入力"
        v-model="subject"
      >
    </div>

    <div class="uk-margin uk-flex uk-flex-center">
      <input 
        class="uk-input uk-form-width-medium"
        type="number"
        placeholder="年度を入力(西暦)"
        v-model="year"
      >
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

    <div class="uk-margin uk-flex uk-flex-center" v-if="toolType==='テスト'">
      <select class="uk-select uk-form-width-medium" v-model="contentType">
        <option disabled value="">用紙の種類を選択</option>
        <option>問題</option>
        <option>解答なし答案用紙</option>
        <option>学生解答</option>
        <option>模範解答</option>
      </select>
    </div>

    <div class="uk-margin uk-flex uk-flex-center" v-if="toolType==='勉強用'">
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
      >
    </div>

    <!-- ファイルドラック&ドロップの処理は出来てない -->
    <div class="uk-flex uk-flex-center uk-margin">
      <div class="js-upload uk-placeholder uk-text-center uk-form-width-large">
        <vk-icon icon="cloud-upload"></vk-icon>
        <span class="uk-text-middle">ファイルをドラック&ドロップ</span>
        <div uk-form-custom>
            <input type="file" multiple>
        </div>
      </div>
    </div>

    <div class="uk-text-center@s uk-margin" v-if="!isSellectedAll">すべての項目を選択してください</div>

    <div class="uk-flex uk-flex-center uk-margin">
      <vk-button
        type="primary"
        class="uk-margin"
        v-bind:disabled="!isSellectedAll"
        v-on:click="upload()"
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
    name: 'App',
    data () {
      return {
        subject: '',
        year: null,
        toolType: '',
        period: '',
        contentType: '',
        author: ''
      }
    },
    computed: {
        isSellectedAll () {
          return this.subject && this.year && this.toolType && this.period && this.contentType && this.author
        }
    },
    methods: {
      toEdit () {
        this.$router.push('edit')
      },
      upload () {
        const newFile = {
          subject: this.subject,
          year: this.year,
          toolType: this.toolType,
          period: this.period,
          contentType: this.contentType,
          author: this.author,
          // image: 'わからん'
        }
        this.$store.disapatch('upload', newFile)
      }
    }
  }
</script>
