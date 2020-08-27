import { createLocalVue, shallowMount } from '@vue/test-utils'
import VuikitIcons from '@vuikit/icons'
import flushPromises from 'flush-promises'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import { Button } from 'vuikit/lib/button'
import { Drop } from 'vuikit/lib/drop'
import { Spinner } from 'vuikit/lib/spinner'
import Upload from '../Upload'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)
localVue.use(Vuikit)
localVue.use(VuikitIcons)

// netlifyIdentityの関数を使えるようにする
jest.mock('netlify-identity-widget')

describe('Upload.vue', () => {
  let router
  let state
  let mutations
  let actions
  let store
  beforeEach(() => {
    netlifyIdentity.open = jest.fn()
    netlifyIdentity.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'login') {
        callback()
      }
    })

    router = new VueRouter()
    state = {
      currentUser: {
        token: {
          access_token: 'token'
        }
      },
      lastPage: '',
      currentBranch: '',

      commits: {},
      contentMetadatas: {},

      branches: {
        status: 'unrequested',
        data: {}
      }
    }

    mutations = {
      updateLastPage: jest.fn()
    }

    actions = {
      updateCurrentUser: jest.fn(),
      getBranches: jest.fn()
    }

    store = new Vuex.Store({
      state,
      mutations,
      actions
    })

    localStorage.clear()
    jest.clearAllMocks()
  })

  it('ページが読み込まれたときにユーザの取得、branchの取得を行う', async () => {
    shallowMount(Upload, {
      store,
      router,
      localVue
    })

    await flushPromises()

    expect(actions.updateCurrentUser).toHaveBeenCalled()
    expect(actions.getBranches).toHaveBeenCalled()
  })

  it('ユーザ情報がstate上にない場合ログインページに遷移する', async () => {
    router.push('/upload')
    state.currentUser = null

    const wrapper = shallowMount(Upload, {
      store,
      router,
      localVue
    })

    await flushPromises()

    expect(actions.updateCurrentUser).toHaveBeenCalled()
    expect(localStorage.setItem).toHaveBeenCalled()
    expect(mutations.updateLastPage).toHaveBeenCalled()
    expect(wrapper.vm.$route.path).toBe('/login')
  })

  it('ブランチ一覧の取得中にはロード中表示にする', () => {
    state.branches.status = 'loading'

    const wrapper = shallowMount(Upload, {
      store,
      router,
      localVue
    })

    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)
  })

  it('表示するbranch一覧はmaster branch以外のbranchを参照する', () => {
    state.branches = {
      status: 'loaded',
      data: {
        master: 'sha1',
        branch1: 'sha2',
        branch2: 'sha3'
      }
    }

    const wrapper = shallowMount(Upload, {
      store,
      router,
      localVue
    })

    const branch1Button = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === 'branch1')
    const branch2Button = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === 'branch2')
    expect(wrapper.vm.branches).toEqual({ branch1: 'sha2', branch2: 'sha3' })
    expect(branch1Button.exists()).toBe(true)
    expect(branch2Button.exists()).toBe(true)
  })

  it('既存のbranchを選択するともbranchNameの値が変わる', async () => {
    state.branches = {
      status: 'loaded',
      data: {
        master: 'sha1',
        branch1: 'sha2'
      }
    }
    const stubs = {
      VkButton: Button,
      VkDrop: Drop
    }
    const wrapper = shallowMount(Upload, {
      store,
      router,
      localVue,
      stubs
    })

    await flushPromises()

    wrapper.findAllComponents(Button).at(3).trigger('click')
    const branch1Button = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === 'branch1')
    branch1Button.at(0).trigger('click')
    expect(wrapper.vm.branchName).toBe('branch1')
  })

  // it('ファイルを選択するとファイル名が表示される', () => {
  //   const wrapper = shallowMount(Upload, {
  //     store,
  //     router,
  //     localVue
  //   })
  // })
})
