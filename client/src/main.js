import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import Vuikit from 'vuikit'
import VuikitIcons from '@vuikit/icons'

import '@vuikit/theme'
import { IconCloudUpload, IconChevronDown, IconCheveronRight } from '@vuikit/icons'

const VueUploadComponent = require('vue-upload-component')

Vue.component('VKIconCheveronRight', IconCheveronRight)
Vue.component('VKIconCloudpload', IconCloudUpload)
Vue.component('VKIconChevronDown', IconChevronDown)
Vue.component('file-upload', VueUploadComponent)

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(Vuikit)
Vue.use(VuikitIcons)

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    exams: []
  },
  mutations: {
    upload: (state, newFile) => {
      state.exams.push(newFile)
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
}).$mount('#app')
