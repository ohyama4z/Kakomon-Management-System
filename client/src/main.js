import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import VuikitIcons from '@vuikit/icons'
import router from './router.js'
import VueSidebarMenu from 'vue-sidebar-menu'

import '@vuikit/theme'
import { IconCloudUpload, IconChevronDown, IconChevronRight } from '@vuikit/icons'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

const VueUploadComponent = require('vue-upload-component')
const netlifyIdentity = require('netlify-identity-widget')

Vue.component('VKIconCheveronRight', IconChevronRight)
Vue.component('VKIconCloudpload', IconCloudUpload)
Vue.component('VKIconChevronDown', IconChevronDown)
Vue.component('file-upload', VueUploadComponent)
// Vue.component('netlifyIdentity', netlifyIdentity)

Vue.use(Vuex)
Vue.use(Vuikit)
Vue.use(VuikitIcons)
Vue.use(VueSidebarMenu)

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    files: [],
    sampleFiles: [{
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
    },
  ]
  },
  mutations: {
    upload: (state, newFile) => {
      state.files.push(newFile)
    }
  },
  actions: {
    upload: async ({ commit }, newFile) => {
      const STO = (delay) => new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, delay)
      })
      await STO(1000)
      commit('upload',newFile)
      console.log('action: upload')
    }
  }
})

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')

module.exports= {netlifyIdentity}