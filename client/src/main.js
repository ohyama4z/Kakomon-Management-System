import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import VuikitIcons from '@vuikit/icons'
import router from './router.js'
import VueSidebarMenu from 'vue-sidebar-menu'
import PromisePool from 'native-promise-pool'


import '@vuikit/theme'
import { IconCloudUpload, IconChevronDown, IconChevronRight } from '@vuikit/icons'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

const VueUploadComponent = require('vue-upload-component')
const netlifyIdentity = require('netlify-identity-widget')

Vue.component('VKIconCheveronRight', IconChevronRight)
Vue.component('VKIconCloudpload', IconCloudUpload)
Vue.component('VKIconChevronDown', IconChevronDown)
Vue.component('file-upload', VueUploadComponent)

Vue.use(Vuex)
Vue.use(Vuikit)
Vue.use(VuikitIcons)
Vue.use(VueSidebarMenu)

Vue.config.productionTip = false

netlifyIdentity.init({
  APIUrl: 'http://localhost:8085/.netlify/identity'
})

const store = new Vuex.Store({
  state: {
    currentUser: netlifyIdentity.currentUser(),
    lastPage: 'upload',
    metadatas: {
      status: 'loaded',
      data: []
    },

    setCsvObj: {
      status: 'unrequested',
    },

    files: [
      {
        src: '001',
        subject: '数学',
        year: 2019,
        toolType: '勉強用',
        period: '前期定期',
        contentType: 'ノート',
        author: 'oy',
        fileName: 'file001'
      },
      {
        src: '002',
        subject: '英語',
        year: 2019,
        toolType: '勉強用',
        period: '後期中間',
        contentType: 'まとめ',
        author: 'oy',
        fileName: 'file002'
      },
      {
        src: '003',
        subject: '英語',
        year: 2018,
        toolType: '勉強用',
        period: '後期中間',
        contentType: 'ノート',
        author: 'oy',
        fileName: 'file003'
      },
      {
        src: '004',
        subject: '英語',
        year: 2018,
        toolType: 'テスト',
        period: '前期定期',
        contentType: '問題',
        author: '松田',
        fileName: 'file004'
      },
      {
        src: '005',
        subject: '論理回路',
        year: 2018,
        toolType: '勉強用',
        period: '後期中間',
        contentType: 'ノート',
        author: 'oy',
        fileName: 'file005'
      },
      {
        src: '006',
        subject: '数学',
        year: 2018,
        toolType: '勉強用',
        period: '後期中間',
        contentType: 'ノート',
        author: 'oy',
        fileName: 'file006'
      },
      {
        src: '007',
        subject: '英語',
        year: 2018,
        toolType: '勉強用',
        period: '後期中間',
        contentType: 'ノート',
        author: 'sk',
        fileName: 'file007'
      },
      {
        src: '008',
        subject: '数学',
        year: 2019,
        toolType: 'テスト',
        period: '前期中間',
        contentType: '問題',
        author: '藤島',
        fileName: 'file008'
      },
      {
        src: '009',
        subject: '数学',
        year: 2019,
        toolType: '勉強用',
        period: '前期定期',
        contentType: '対策プリント',
        author: '藤島',
        fileName: 'file009'
      },
      {
        src: '010',
        subject: '英語',
        year: 2018,
        toolType: '勉強用',
        period: '後期中間',
        contentType: '対策プリント',
        author: 'oy',
        fileName: 'file010'
      }
    ],
  },

  mutations: {
    setStatusLoading: (state, req) => {
      req.status = 'loading'
    },
    upload: (state, newFile) => {
      state.files.push(newFile)
    },
    setServerSideLanguage: (state, languageName) => {
      state.serverSideLanguage = {
        status: 'loaded',
        name: languageName,
      }
    },

    setBranches: (state, data) => {
      state.metadata = {
        status: 'loaded',
        branches : data,
      }
    },

    getCurrentUser: (state) => {
      const user = netlifyIdentity.currentUser()
      state.currentUser = user
    },

    updateLastPage: (state) => {
      const lastPageInStrage = localStorage.getItem('lastPage')
      const lastPage = lastPageInStrage == null ? 'upload' : lastPageInStrage
      state.lastPage = lastPage
      console.log('うあ', state.lastPage)
    },

    getBranches: (state, res) => {
      console.log(res)
      const branches = JSON.parse(JSON.stringify(res))
      state.metadatas = {
        status: 'loaded',
        data: branches
      }
    },

    setCsvObj: (state, csvObj) => {
      state.setCsvObj.status = 'loaded'
      state.files = csvObj
    }
  },

  actions: {
    upload: async ({ commit }, newFile) => {
      commit('upload',newFile)

      console.log('action: upload')
    },

    get: async ({commit, state}) => {
      const token = state.currentUser.token.access_token
      const method = 'GET'
      const headers = {
        Authorization: `Bearer ${token}`
      }
      const httpRes = await fetch('http://localhost:8085/.netlify/git/github/branches', {method, headers})
      const res = await httpRes.json()
      console.log('ahoahoa', httpRes, res)

      commit('getBranches', res)
    },

    getMetadatas: async ({commit, state}) => {
      const token = state.currentUser.token.access_token
      const method = 'GET'
      const headers = {
        Authorization: `Bearer ${token}`
      }
      const httpRes = await fetch('http://localhost:8085/.netlify/git/github/branches', {method, headers})
      const res = await httpRes.json()

      commit('getBranches', res)
    },

    getBranchData: async ({ commit, state }, branchName) => {
      commit('setStatusLoading', state.setCsvObj)

      const token = state.currentUser.token.access_token
      const method = 'GET'
      const headers = {
        Authorization: `Bearer ${token}`
      }
      console.log(branchName)
      const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${branchName}`, {method, headers})
      // const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas/unassorted.csv?ref=${branchName}`, {method, headers})
      const resArr = await httpRes.json()
      console.log('^_^',resArr)

      let csvObj = {}
      const pool = new PromisePool(50) // 50 tasks at once

      resArr.forEach(res => {
        pool.open(async () => {
          const previousResStr = localStorage.getItem(`${branchName}_${res.name}`)
          const previousRes = JSON.parse(previousResStr)
          
          if (previousRes == null || res.sha !== previousRes.sha) {
            console.log('manukemanuke')
            const httpResponse = await fetch(`http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${branchName}`, {method, headers})
            const response = await httpResponse.json()
            const strRes = JSON.stringify(response)
            localStorage.setItem(`${branchName}_${res.name}`,strRes)
          }

          const curResStr = localStorage.getItem(`${branchName}_${res.name}`)
          const curRes = JSON.parse(curResStr)
          console.log('^^;', curRes)
          const buffer = new Buffer(curRes.content, 'base64')
          const csvData = buffer.toString('utf8')
          // console.log(csvData)
          const resultObj = convertCsvToObjArray(csvData);
          // console.log(resultObj)
          // console.log("hoge",resultObj)

          csvObj = Object.assign(csvObj, resultObj)
        })
      })

      
      
      console.log(':(', csvObj)

      commit('setCsvObj', csvObj)
    }
  }
})

const convertCsvToObjArray = (csv) => {
  //header:CSV1行目の項目 :csvRows:項目に対する値
  const [header, ...csvRows] = csv.split('\n').filter((row) => {
    if (row !== '') {
      return row;
    }
  }).map((row) => {
    return row.split(',');
  });

  let arrayInKeyAndValue;
  let resultArray;
  let tmpResultArray;

  tmpResultArray = csvRows.map((r) => {
    arrayInKeyAndValue = header.map((_, index) => {
      //ヘッダーの空白文字を削除。keyとvalueに値をセット
      return ({ key: header[index].replace(/\s+/g, ''), value: r[index] });
    });
    arrayInKeyAndValue = arrayInKeyAndValue.reduce((previous, current) => {
      //{key: "物", value: "MacBook", メーカー: "apple", 値段: "3000"}を作成
      previous[current.key] = current.value;
      return previous;
    }, {});
    return arrayInKeyAndValue;
  });

  resultArray = tmpResultArray.reduce((previous, current) => {
    previous[current.src] = current;
    return previous;
  }, {});
  return resultArray;
}

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')
