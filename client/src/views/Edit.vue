<template>
  <div>
    <!-- サイドバーをカッコよく実装するやべーやつ -->
    <sidebar-menu :menu="getSidebarMenu" />

    <h1 class="uk-text-center@s">過去問編集フォーム</h1>

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
      >アップロード</vk-button>
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
      }
    },

    computed: {
      isSellectedAll () {
        return this.subject && this.year && this.toolType && this.period && this.contentType && this.author
      },

      getSidebarMenu () {
        const header = [{
          header: true,
          title: '過去問管理',
          hiddenOnCollapse: true
        }]

        return header.concat(this.getMenuStructure)
      },

      intermediateFiles () {
        return this.$store.state.sampleFiles.reduce((previous, current) => {
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

      getMenuStructure () {
        const icon = 'fa fa-folder'
        return Object.entries(this.intermediateFiles).reduce((previous, [period, value]) => {
          previous.push({
            title: period,
            icon,
            child: generateChildOfPeriod(value)
          })
          return previous
        }, [])

        function generateChildOfPeriod(yearValue) {
          return Object.entries(yearValue).reduce((previous, [subject, subjectValue]) => {
            previous.push({
              title: subject,
              icon,
              child: generateChildOfSubject(subjectValue)
            })
            return previous
          }, [])
        }

        function generateChildOfSubject(subjectValue) {
          return Object.entries(subjectValue).reduce((previous, [toolType, toolTypeValue]) => {
            previous.push({
              title: toolType,
              icon,
              child: generateChildOfToolType(toolTypeValue)
            })
            return previous
          }, [])
        }

        function generateChildOfToolType(toolTypeValue) {
          return Object.entries(toolTypeValue).reduce((previous, [year, yearValue]) => {
            previous.push({
              title: year,
              icon,
              child: generateChildOfYear(yearValue)
            })
            return previous
          }, [])
        }

        function generateChildOfYear(yearValue) {
          return Object.entries(yearValue).reduce((previous, [contentType, contentTypeValue]) => {
            previous.push({
              title: contentType,
              icon,
              child: generateChildOfContentType(contentTypeValue)
            })
            return previous
          }, [])
        }

        function generateChildOfContentType(contentTypeValue) {
          return contentTypeValue.map(file => {
            return {
              title: file.fileName,
              icon: 'fa fa-file'
            }
          })
        }
      }
    },

    methods: {
      toUpload () {
        this.$router.push('upload')
      },
    },
  }
</script>
