import { createLocalVue, shallowMount } from '@vue/test-utils'
import 'jest-localstorage-mock'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Navbar from '../Navbar'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)
// localVue.use(Vuikit)

const router = new VueRouter()

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

describe('Edit.vue', () => {
  it('"アップロード"ボタンを押すと/uploadに遷移する', () => {
    const wrapper = shallowMount(Navbar, {
      store,
      router,
      localVue
    })

    console.log(wrapper.html())
    // console.log(wrapper.find('vk-button-stub'))
  })
})
