import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import Upload from './views/Upload'
import Edit from './views/Edit'
import mytest from './views/mytest'
import Login from './views/Login'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
    path: '/',
    redirect: { name: 'upload' }
    },
    {
      path: '/app',
      name: 'App',
      component: App
    },
    {
    path: '/edit',
    name: 'edit',
    component: Edit
    },
    {
      path: '/upload',
      name: 'upload',
      component: Upload
    },
    {
      path: '/mytest',
      name: 'mytest',
      component: mytest
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/edit/:branchName/:fileType',
      name: 'EditFileType',
      component: Edit
    }
  ]
})