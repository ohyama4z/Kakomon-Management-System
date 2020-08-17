import VuikitIcons, {
  IconChevronDown,
  IconChevronRight,
  IconCloudUpload
} from '@vuikit/icons'
import '@vuikit/theme'
import Vue from 'vue'
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import App from './App.vue'
import router from './router.js'
import actions from './store/actions'
import mutations from './store/mutations'
import state from './store/state'

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
  state,
  mutations,
  actions
})

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')
