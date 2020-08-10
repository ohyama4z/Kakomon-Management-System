<template>
  <div>
    <div></div>
    <h1 class="uk-text-center@s">過去問編集フォーム</h1>

    <div v-if="isSelectedInfo">
      <sidebar-menu :menu="sidebarMenu" />

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

      <div class="uk-text-center@s uk-margin" v-if="!isSellectedAll">すべての項目を選択してください</div>

      <div class="uk-flex uk-flex-center uk-margin">
        <vk-button
          type="primary"
          class="uk-margin"
          v-bind:disabled="!isSellectedAll"
          v-on:click="upload()"
        >編集をコミット</vk-button>
      </div>
    </div>

    <div v-else>
      <div class="uk-text-center@s uk-margin">編集の形式を選択してください。</div>
      <div class="uk-margin uk-flex uk-flex-center">
        <select class="uk-select uk-form-width-medium" v-model="editType">
          <option disabled value="">編集の形式を選択</option>
          <option value="editUnnamed">未編集のファイルの情報を入力する</option>
          <option value="editNamed">編集済みのファイルの情報を更新する</option>
        </select>
      </div>
      <div class="uk-text-center@s uk-margin">> {{ displayEditType }}</div>

      <div class="uk-margin-large">
        <div class="uk-text-center@s uk-margin">編集するブランチを選択してください。</div>
        <div class="uk-margin uk-flex uk-flex-center">
          <select class="uk-select uk-form-width-medium" v-model="selectedBranch">
            <option disabled value="">ブランチを選択</option>
            <option v-for="branch in branches" v-bind:key="branch.index">{{ branch.name }}</option>
          </select>
        </div>
      </div>


      <div class="uk-margin uk-flex uk-flex-center">
        <vk-button
          type="primary"
          v-bind:disabled="!readyForRequest"
          v-on:click="requestBranchData()"
        >決定</vk-button>
      </div>
    </div>

    <div class="uk-position-bottom uk-overlay uk-overlay-default uk-text-center">
      ※過去問編集フォームの使い方がわからない場合は、
      <a class="uk-link-toggle" href="https://github.com/asann3/Kakomon-Management-System/blob/master/client/manuals/README.md" target="_blank">
        README.md
      </a>
      を参照してください。
    </div>

    <div class="uk-position-medium uk-position-top-right uk-overlay uk-overlay-default">
      <button class="uk-button uk-button-link" v-on:click="toUpload">アップロード画面へ
        <vk-icon icon="chevron-right"></vk-icon>
      </button>
    </div>

  </div>
</template>


<script>
  export default {
    name: 'edit',

    data () {
      return {
        subject: '',
        year: null,
        toolType: '',
        period: '',
        contentType: '',
        author: '',
        isSelectedInfo: false,
        selectedBranch: '',
        editType: ''
      }
    },

    computed: {
      isSellectedAll () {
        return this.subject && this.year && this.toolType && this.period && this.contentType && this.author
      },

      readyForRequest () {
        return this.selectedBranch && this.editType
      },

      displayEditType () {
        if (this.editType === 'editUnnamed') {
          return '未編集のファイルの情報を入力する'
        } 
        
        if (this.editType === 'editNamed') {
          return '編集済みのファイルの情報を更新する'
        }

         return '編集の形式を入力してください'
      },

      sidebarMenu () {
        const header = [{
          header: true,
          title: '過去問管理',
          hiddenOnCollapse: true
        }]
        //this.getMenuStructure の第2引数は period, subject, toolType, year, contentType, fileNameで計6
        const dataTree = this.getMenuStructure (this.intermediateFiles, 6)
        return header.concat(dataTree)
      },

      intermediateFiles () {
        return this.$store.state.files.reduce((previous, current) => {
          if (previous == null) {
            previous = {}
          }

          if (previous[current.period] == null) {
            previous[current.period] = {}
          }
          if (previous[current.period][current.subject] == null) {
            previous[current.period][current.subject] = {}
          }

          if (previous[current.period][current.subject][current.toolType] == null) {
            previous[current.period][current.subject][current.toolType] = {}
          }

          if (previous[current.period][current.subject][current.toolType][current.year] == null) {
            previous[current.period][current.subject][current.toolType][current.year] = {}
          }

          if (previous[current.period][current.subject][current.toolType][current.year][current.contentType] == null) {
            previous[current.period][current.subject][current.toolType][current.year][current.contentType] = []
          }

          previous[current.period][current.subject][current.toolType][current.year][current.contentType].push(current)

          return previous
        }, {})
      },

      branches () {
        return this.$store.state.metadatas.data
      }
    },

    methods: {
      toUpload () {
        this.$router.push('upload')
      },

      getMenuStructure (intermediateFiles, keyNum) {
        const icon = 'fa fa-folder'
        if (keyNum <= 1) {
          return intermediateFiles.map(file => ({
            title: file.fileName,
            icon: 'fa fa-file'
          }))
        }
        return Object.entries(intermediateFiles).reduce((previous, [key, value]) => {
          previous.push({
            title: key,
            icon,
            child: this.getMenuStructure(value, keyNum-1)
          })
          return previous
        }, [])
      },

      requestBranchData () {
        this.isSelectedInfo = true
      }
    },
  }
</script>
