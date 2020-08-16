import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Login from '../Login'
// import Mctions from '../../store/mutations'

const netlifyIdentity = require('netlify-identity-widget')

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)

const router = new VueRouter()

// netlifyIdentityの関数を使えるようにする
jest.mock('netlify-identity-widget')
netlifyIdentity.open = jest.fn()
netlifyIdentity.on = jest.fn().mockImplementation((event, callback) => {
  if (event === 'login') {
    callback()
  }
})

describe('Login.vue', () => {
  it('currentUserがログイン済みのとき最後に開いたパスに飛ばすmutationが呼ばれ、lastPageに遷移する', () => {
    const mutations = {
      getCurrentUser: jest.fn(),
      updateLastPage: jest.fn()
    }
    const actions = {
      updateCurrentUser: jest.fn()
    }
    const store = new Vuex.Store({
      state: {
        currentUser: true,
        lastPage: 'edit'
      },
      mutations,
      actions
    })
    const wrapper = shallowMount(Login, {
      localVue,
      router,
      store
    })

    expect(actions.updateCurrentUser).toHaveBeenCalled()
    expect(mutations.updateLastPage).toHaveBeenCalled()
    expect(wrapper.vm.$route.path).toBe(`/${store.state.lastPage}`)
  })

  it('netlify-identity-widgetでログインしたら最後に開いたパスに飛ばすmutationが呼ばれ、lastPageに遷移する', () => {
    const mutations = {
      getCurrentUser: jest.fn(),
      updateLastPage: jest.fn()
    }
    const actions = {
      updateCurrentUser: jest.fn()
    }
    const store = new Vuex.Store({
      state: {
        lastPage: 'edit'
      },
      mutations,
      actions
    })

    const wrapper = shallowMount(Login, {
      localVue,
      router,
      store
    })

    expect(actions.updateCurrentUser).toHaveBeenCalled()
    expect(netlifyIdentity.on).toHaveBeenCalled()
    expect(mutations.updateLastPage).toHaveBeenCalled()
    expect(wrapper.vm.$route.path).toBe(`/${store.state.lastPage}`)
  })
})

// todo
// ログイン済みじゃないときのも追加しろ
