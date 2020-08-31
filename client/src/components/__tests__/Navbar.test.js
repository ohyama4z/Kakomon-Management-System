import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import VuikitIcons from '@vuikit/icons'
import 'jest-localstorage-mock'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import { Button } from 'vuikit/lib/button'
import Navbar from '../Navbar'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)
localVue.use(Vuikit)
localVue.use(VuikitIcons)

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

describe('Navbar.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it(`"アップロード"ボタンを押すと/uploadに遷移する`, () => {
    router.push(`/edit`)
    const wrapper = mount(Navbar, {
      store,
      router,
      localVue
    })

    const uploadButtonWrapper = wrapper.findAllComponents(Button).at(0)

    expect(uploadButtonWrapper.text()).toBe(`アップロード`)
    uploadButtonWrapper.trigger('click')
    expect(wrapper.vm.$route.path).toBe('/upload')
  })

  it(`"編集"ボタンを押すと/editに遷移する`, () => {
    router.push(`/upload`)
    const wrapper = mount(Navbar, {
      store,
      router,
      localVue
    })

    const editButtonWrapper = wrapper.findAllComponents(Button).at(1)

    expect(editButtonWrapper.text()).toBe(`編集`)
    editButtonWrapper.trigger('click')
    expect(wrapper.vm.$route.path).toBe('/edit')
  })

  it(`/uploadの場合"アップロード"ボタンは枠線だけの表示にし、"編集"ボタンは青色の表示にする`, () => {
    router.push(`/upload`)
    const wrapper = shallowMount(Navbar, {
      store,
      router,
      localVue
    })
    const uploadButtonWrapper = wrapper.findAllComponents(Button).at(0)
    const editButtonWrapper = wrapper.findAllComponents(Button).at(1)
    expect(uploadButtonWrapper.attributes().type).toBe(``)
    expect(editButtonWrapper.attributes().type).toBe(`primary`)
  })

  it(`/editの場合"編集"ボタンは枠線だけの表示にし、"アップロード"ボタンは青色の表示にする`, () => {
    router.push(`/edit`)
    const wrapper = shallowMount(Navbar, {
      store,
      router,
      localVue
    })
    const uploadButtonWrapper = wrapper.findAllComponents(Button).at(0)
    const editButtonWrapper = wrapper.findAllComponents(Button).at(1)
    expect(uploadButtonWrapper.attributes().type).toBe(`primary`)
    expect(editButtonWrapper.attributes().type).toBe(``)
  })

  it(`branchを選択するとそのコミット情報を取得するactionが走る`, () => {
    const wrapper = mount(Navbar, {
      store,
      router,
      localVue
    })

    wrapper.find('select').trigger('change')
    expect(actions.selectBranch).toHaveBeenCalled()
  })

  it('ログアウトを押すと/logoutに遷移する', () => {
    router.push(`/edit`)
    const wrapper = mount(Navbar, {
      store,
      router,
      localVue
    })

    const logoutButtonWrapper = wrapper.findAllComponents(Button).at(2)
    expect(logoutButtonWrapper.text()).toBe(`ログアウト`)
    logoutButtonWrapper.trigger('click')
    expect(wrapper.vm.$emit).toHaveBeenCalledWith('beforeLogout')
    expect(wrapper.vm.$route.path).toBe('/logout')
  })
})
