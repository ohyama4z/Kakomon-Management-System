import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

Vue.config.productionTip = false

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment: (state, amount) => state.count += parseInt(amount, 10),
    decrement: (state, amount) => state.count -= parseInt(amount, 10)
  }
})

new Vue({
  render: h => h(App),
  store,
}).$mount('#app')
