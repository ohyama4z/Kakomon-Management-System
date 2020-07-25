import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import Edit from './Edit.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
    path: '/',
    redirect: { name: 'App' }
    },
    {
      path: '/app',
      name: 'App',
      component: App
      }
    {
    path: '/edit',
    name: 'edit',
    component: Edit
    }
  ]
})