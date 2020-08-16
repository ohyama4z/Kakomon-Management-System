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
const moment = require('moment')

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
      status: 'unrequested',
      data: []
    },

    setCsvObj: {
      status: 'unrequested',
    },
    files: [],
    sampleFiles: [
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
    img: [
      {
        src: '001',
        img: 'blob:http://localhost:8082/9a582659-277b-4242-8e12-264754e0ae6c'
      },
      {
        src: '002',
        img: 'blob:http://localhost:8082/b230aec2-fe23-461f-84ad-5a21945f8ea1'
      }
    ]
  },

  mutations: {
    setStatusLoading: (state, req) => {
      req.status = 'loading'
    },

    upload: (state, newFile) => {
      state.files.push(newFile)
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
      console.log('next page after loging in', state.lastPage)
    },

    getBranches: (state, res) => {
      console.log(res)
      const branches = JSON.parse(JSON.stringify(res))
      state.metadatas = {
        status: 'loaded',
        data: branches
      }
    },

    branchDataOnGithub: (state, data) =>{
      state[data.branchName][data.fileName] = data.branchData
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

    getBranchData: async ({ commit, state }, branchName, sendObj) => {
      commit('setStatusLoading', state.setCsvObj)

      const token = state.currentUser.token.access_token
      const method = 'GET'
      const headers = {
        Authorization: `Bearer ${token}`
      }
      console.log(branchName)
      const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${branchName}`, {method, headers})
      const resArr = await httpRes.json()
      // console.log('^_^',resArr)

      let csvObj = {}
      const pool = new PromisePool(50) // 50 tasks at once
      localStorage.removeItem(`${branchName}_lastItem`)

      resArr.forEach(res => {
        pool.open(async () => {
          const previousResStr = localStorage.getItem(`${branchName}_${res.name}`)
          const previousRes = JSON.parse(previousResStr)
          // const previousRes = state[`${branchName}`][`${res.name}`]
          
          if (previousRes == null || res.sha !== previousRes.sha) {
            const httpResponse = await fetch(`http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${branchName}`, {method, headers})
            const response = await httpResponse.json()
            // const strRes = JSON.stringify(response)
            // localStorage.setItem(`${branchName}_${res.name}`,strRes)
            commit('branchDataOnGithub' ,{
              branchData: response,
              branchName,
              fileName: res.name
            })
          }

          const curResStr = localStorage.getItem(`${branchName}_${res.name}`)
          const curRes = JSON.parse(curResStr)
          // const curRes = state[`${branchName}`][`${res.name}`]

          const buffer = new Buffer(curRes.content, 'base64')
          const csvData = buffer.toString('utf8')
          const resultObj = convertCsvToObjArray(csvData)

          csvObj = Object.assign(csvObj, resultObj)
        })
      })
      // localStorage.setItem(`${branchName}_lastItem`, 'set')

      


    // commitCSV: async ({ state }, sendObj) => {
      // const token = state.currentUser.token.access_token
      const getmethod = 'GET'
      // const postmethod = 'POST'
      // const patchmethod = 'POST'
      // const headers = {
      //   Authorization: `Bearer ${token}`
      // }
      
      console.log('refarr', resArr[0].sha) //filehash
      
      // refの取得
      const branchref = await fetch(`http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`, {getmethod, headers})
      const parseref = await branchref.json()
      console.log('branch毎のハッシュ',`${branchName}` , parseref.object.sha)
      
      // commitの取得
      const commithttpRes = await fetch(`http://localhost:8085/.netlify/git/github/commits/${parseref.object.sha}`, {getmethod, headers})
      const commitres = await commithttpRes.json()
      console.log(':p~', commitres, sendObj)

      const postcontents = {
        content: 'dGVzdCBjb21taXQ=',
        encoding: 'base64'
      };
      const bodys = JSON.stringify(postcontents)
      // blobの作成
      const refhttpRes = await fetch(`http://localhost:8085/.netlify/git/github/git/blobs?ref=${branchName}`, {method: 'POST', headers, body: bodys}); // { headerss: {'Content-Type': 'application/json'}}
      const refres = await refhttpRes.json()
      console.log(':q~', refres)

      // const masmaster = await fetch('http://localhost:8085/.netlify/git/github/branches/master', {method: 'GET', headers})
      // const masres = await masmaster.json()

      // console.log(commitres.sha, masres.commit.sha) 同じ値
      const treesbody = 
      {
        // base_tree: commitres.sha,
        base_tree: commitres.commit.tree.sha,
        tree: [{
            path: 'README.md',
            mode: '100644', // 100644  100755 , 040000 160000  シンボリックリンクのパス120000 
            type: 'blob',
            sha: refres.sha,
            // content: "hoge"
          }
          // ,
          // {
          //   path: ""
          // }
        ]
      }
      // treeの作成
      const treesbodys = JSON.stringify(treesbody)
      const branchhttpRes = await fetch('http://localhost:8085/.netlify/git/github/git/trees', {method: 'POST', headers, body: treesbodys});
      const branchres = await branchhttpRes.json()
      console.log("branchesres", branchres)
      console.log("check", refres.sha, branchres.sha, parseref.object.sha)
      const date = moment().format('YYYY-MM-DDThh:mm:ssZ')
      console.log("time", date)

      const commitsbody = 
      {
        message: "test commit",
        author: {
          name: "test",
          email: "hoge@gmail.com",
          // date: "2020-08-15T02:27:22.296Z"
          // date: `${timestamp}`
          date
        },
        parents: [
          // refres.sha
          parseref.object.sha
        ],
        tree: branchres.sha
      }
      const commitsbodys = JSON.stringify(commitsbody)
      console.log(commitsbodys)
      // commitの作成
      const createcommithttpres = await fetch(`http://localhost:8085/.netlify/git/github/git/commits?ref=${branchName}`, {method: 'POST', headers, body: commitsbodys});
      const createcommitres = await createcommithttpres.json()
      console.log("commithash", createcommitres.sha)

      // refの更新
      const updatebody = {
        sha: createcommitres.sha,
        force: false // 強制pushするか否
      }
      const updatebodys = JSON.stringify(updatebody)
      const updaterefhttpres = await fetch(`http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`, {method: 'PATCH', headers, body: updatebodys})
      const updaterefres = await updaterefhttpres.json()
      console.log('asdf', updaterefres)
      console.log(':(', csvObj)

      commit('setCsvObj', csvObj)

    },
    // editCSV: async ( {state}, branchname, editFile ) => {
    //   const token = state.currentUser.token.access_token

    //   const base64csv = btoa(editFile)
    //   const body = btoa(sendObject)
    //   // const body = ~~~~~~~(sendObject)~~~~~s
    //   const httpRes = await fetch(`http://localhost:8085/.netlify/git//github/git/trees/${branchname}/:metadatas`, {method, headers, body}) //refs/heads/master

    // }
  }
})

// blobs //github/git/blobs post    content:ファイルの文字列(base64エンコードしたものとか) encoding:base64(utf-8という選択もある) request payload  
// master //github/branches/master  get
// trees //github/git/trees post    base_tree(masterから返ってくるcommithash commit.sha) tree(配列) {path: ,mode: , sha: blobs叩いた時に返ってくるsha, type: "blob"}
// commit //github/git/commits    author:{name: , email: , date: } parents: [master叩いた時に返ってくるcommit.sha] tree: [trees叩いた時に返ってくるsha]
// master // github/git/refs/heads/master 

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

// const asyncLocalStorage = {
//   setItem: async function (key, value) {
//       await null;
//       return localStorage.setItem(key, value);
//   },
//   getItem: async function (key) {
//       await null;
//       return localStorage.getItem(key);
//   }
// };

// export const mutations = {
//   editCSV: (state, editFile) => {
//     state.files.push(editFile)
//   }
// }

// export default new Vuex.Store({
//   // state,
//   mutations,
//   // actions
// })

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')
