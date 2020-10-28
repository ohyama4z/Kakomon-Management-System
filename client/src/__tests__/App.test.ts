import { createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)

describe('App.vue', () => {
  let router: VueRouter
  beforeEach(() => {
    router = new VueRouter()
  })

  it('stateの通知が変更されると画面下に通知が表示される', () => {})
})
