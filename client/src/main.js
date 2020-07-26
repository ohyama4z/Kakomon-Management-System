import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import VuikitIcons from '@vuikit/icons'
import router from './router.js'
import VueSidebarMenu from 'vue-sidebar-menu'


import '@vuikit/theme'
import { IconCloudUpload, IconChevronDown, IconCheveronRight } from '@vuikit/icons'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

const VueUploadComponent = require('vue-upload-component')

Vue.component('VKIconCheveronRight', IconCheveronRight)
Vue.component('VKIconCloudpload', IconCloudUpload)
Vue.component('VKIconChevronDown', IconChevronDown)
Vue.component('file-upload', VueUploadComponent)

Vue.use(Vuex)
Vue.use(Vuikit)
Vue.use(VuikitIcons)
Vue.use(VueSidebarMenu)

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    files: []
  },
  mutations: {
    upload: (state, newFile) => {
      state.files.push(newFile)
    }
  },
  actions: {
    upload: ({ commit }) => {
      commit('upload')
    }
  }
})

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')
