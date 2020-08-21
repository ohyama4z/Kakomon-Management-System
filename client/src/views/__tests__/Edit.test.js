import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Edit from '../Edit'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)
// localVue.use(Vuikit)

const router = new VueRouter()

// netlifyIdentityの関数を使えるようにする
jest.mock('netlify-identity-widget')
netlifyIdentity.open = jest.fn()
netlifyIdentity.on = jest.fn().mockImplementation((event, callback) => {
  if (event === 'login') {
    callback()
  }
})

const state = {
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

const getters = {
  currentBranchMetadatas: jest.fn(() => ({
    src1: {
      src: 'src1',
      subj: 'subj',
      year: 'year',
      content_type: 'content_type',
      tool_type: 'tool_type',
      period: 'period'
    }
  }))
}

const mutations = {
  updateLastPage: jest.fn()
}

const actions = {
  getBranches: jest.fn(),
  selectBranch: jest.fn(),
  getCommit: jest.fn()
}

const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions
})

const stubs = {
  'vk-spinner': {
    template: `<div class="vk-spinner-stub"></div>`
  },
  'vk-button': {
    template: `<button class="vk-button-stub"></button>`
  }
}

describe('Edit.vue', () => {
  it('ページが読み込まれたときにbranchの取得,及びファイルの取得を行う', async () => {
    shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })

    await flushPromises()

    expect(actions.getBranches).toHaveBeenCalled()
    expect(actions.selectBranch).toHaveBeenCalled()
    expect(actions.getCommit).toHaveBeenCalled()

    jest.clearAllMocks()
  })

  it('ユーザ情報がstate上にない場合ログインページに遷移する', async () => {
    state.currentUser = null

    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })

    await flushPromises()

    expect(localStorage.setItem).toHaveBeenCalled()
    expect(mutations.updateLastPage).toHaveBeenCalled()
    expect(wrapper.vm.$route.path).toBe('/login')

    localStorage.setItem.mockClear()
    jest.clearAllMocks()
  })

  it('ブランチ一覧の取得中にはロード中表示にする', () => {
    state.currentBranch = 'master'
    state.commits = {
      master: {
        status: 'loaded'
      }
    }
    state.branches.status = 'loading'

    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })

    const vkspinnerComponent = wrapper.find('.vk-spinner-stub')

    console.log(vkspinnerComponent)
    expect(wrapper.vm.isLoading).toBe(true)
    expect(vkspinnerComponent.exists()).toBe(true)

    jest.clearAllMocks()
  })

  it('コミット情報の取得中にはロード中表示にする', () => {
    state.currentBranch = 'master'
    state.commits = {
      master: {
        status: 'loading'
      }
    }
    state.branches.status = 'loaded'

    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })

    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.find('.vk-spinner-stub').exists()).toBe(true)

    jest.clearAllMocks()
  })
})
