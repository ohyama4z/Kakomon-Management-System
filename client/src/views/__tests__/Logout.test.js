import { createLocalVue, shallowMount } from '@vue/test-utils'
import netlifyIdentity from 'netlify-identity-widget'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Logout from '../Logout'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)

const router = new VueRouter()

// netlifyIdentityの関数を使えるようにする
jest.mock('netlify-identity-widget')

netlifyIdentity.logout = jest.fn()
netlifyIdentity.on = jest.fn().mockImplementation((event, callback) => {
  if (event === 'logout') {
    callback()
  }
})

describe('Logout.vue', () => {
  it('ログインしていないときに/logoutにするとおかしくならないようにする', () => {
    router.push('/logout')
    netlifyIdentity.currentUser = jest.fn(() => {
      return null
    })
    const wrapper = shallowMount(Logout, {
      localVue,
      router
    })

    expect(wrapper.vm.$route.path).toBe('/login')
    expect(netlifyIdentity.logout).not.toHaveBeenCalled()
    expect(netlifyIdentity.on).not.toHaveBeenCalled()
  })
  it('ページが読み込まれるとログアウトするactionが呼ばれ、/loginへ遷移する', () => {
    netlifyIdentity.currentUser = jest.fn(() => {
      return true
    })
    router.push('/logout')
    const actions = {
      updateCurrentUser: jest.fn()
    }
    const store = new Vuex.Store({
      actions
    })
    const wrapper = shallowMount(Logout, {
      localVue,
      router,
      store
    })

    expect(netlifyIdentity.logout).toHaveBeenCalled()
    expect(netlifyIdentity.on).toHaveBeenCalled()
    expect(actions.updateCurrentUser).toHaveBeenCalled()
    expect(wrapper.vm.$route.path).toBe('/login')
  })
})
