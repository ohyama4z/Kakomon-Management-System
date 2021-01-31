// @ts-ignore
import VuikitIcons from '@vuikit/icons'
import '@vuikit/theme'
// @ts-ignore
import netlifyIdentity from 'netlify-identity-widget'
import Vue from 'vue'
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import * as Vuex from 'vuex'
// @ts-ignore
import Vuikit from 'vuikit'
import App from './App.vue'
import router from './router'
import actions from './store/actions'
import getters from './store/getters'
import mutations from './store/mutations'
import state from './store/state'

const initUrl = process.env.VUE_APP_INIT_URL

Vue.use(Vuex)
Vue.use(Vuikit)
Vue.use(VuikitIcons)
Vue.use(VueSidebarMenu)

Vue.config.productionTip = false

netlifyIdentity.init({
  APIUrl: `${initUrl}/.netlify/identity`
})

const vuexOptions = {
  state,
  getters,
  mutations,
  actions
}
export const store = new Vuex.Store(vuexOptions)

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')
