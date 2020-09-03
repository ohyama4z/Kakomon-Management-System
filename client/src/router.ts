import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import Edit from './views/Edit.vue'
import Login from './views/Login.vue'
import Logout from './views/Logout.vue'
import mytest from './views/mytest.vue'
import Root from './views/Root.vue'
import Upload from './views/Upload.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Root',
      component: Root
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
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    }
  ]
})
