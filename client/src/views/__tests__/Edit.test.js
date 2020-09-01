import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import { Button } from 'vuikit/lib/button'
import { Spinner } from 'vuikit/lib/spinner'
import Navbar from '../../components/Navbar'
import Edit from '../Edit'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)
// localVue.use(Vuikit)

describe('Edit.vue', () => {
  let state
  let getters
  let mutations
  let actions
  let store
  let router

  beforeEach(() => {
    router = new VueRouter()
    // netlifyIdentityの関数を使えるようにする
    jest.mock('netlify-identity-widget')
    netlifyIdentity.open = jest.fn()
    netlifyIdentity.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'login') {
        callback()
      }
    })

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
      changedFiles: {},

      branches: {
        status: 'unrequested',
        data: {}
      }
    }

    getters = {
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

    mutations = {
      updateLastPage: jest.fn(),
      setChangedFiles: jest.fn()
    }

    actions = {
      updateCurrentUser: jest.fn(),
      getBranches: jest.fn(),
      selectBranch: jest.fn(),
      getCommit: jest.fn()
    }

    store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('ページが読み込まれたときにbranchの取得,及びファイルの取得を行う', async () => {
    shallowMount(Edit, {
      store,
      router,
      localVue
    })

    await flushPromises()

    expect(actions.getBranches).toHaveBeenCalled()
    expect(actions.selectBranch).toHaveBeenCalled()
    expect(actions.getCommit).toHaveBeenCalled()
  })

  it('ユーザ情報がstate上にない場合ログインページに遷移する', async () => {
    state.currentUser = null

    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue
    })

    await flushPromises()

    expect(localStorage.setItem).toHaveBeenCalled()
    expect(mutations.updateLastPage).toHaveBeenCalled()
    expect(wrapper.vm.$route.path).toBe('/login')
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
      localVue
    })

    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)
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
      localVue
    })

    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)
  })

  it('"編集をコミット"ボタンを押すとstateにファイルごとの変更情報を置く', async () => {
    const stubs = {
      VkButton: Button
    }
    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })
    await flushPromises()
    const subjInput = wrapper.find('input[placeholder="教科名を入力"]')
    const yearInput = wrapper.find('input[placeholder="年度を入力(西暦)"]')
    const toolTypeInput = wrapper.findAll('select').at(0)
    const periodInput = wrapper.findAll('select').at(1)
    const authorInput = wrapper.find('input[placeholder="用紙作成者,担当教員"]')
    const commitButton = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === '編集をコミット')
      .at(0)

    subjInput.setValue('数学')
    yearInput.setValue('2020')
    toolTypeInput.setValue('勉強用')
    periodInput.setValue('前期中間')
    authorInput.setValue('おれ')
    await new Promise(resolve => setTimeout(resolve, 5))
    const contentTypeInput = wrapper.findAll('select').at(2)
    contentTypeInput.setValue('ノート')
    await new Promise(resolve => setTimeout(resolve, 5))

    expect(wrapper.vm.isSellectedAll).not.toBeFalsy()
    commitButton.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(mutations.setChangedFiles).toHaveBeenCalled()
  })

  it('Navbarのログアウトが押されるとログアウトの処理を行う', async () => {
    const stubs = {
      VkButton: Button
    }

    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })
    await flushPromises()
    wrapper.findComponent(Navbar).vm.$emit('before-logout')
    expect(localStorage.setItem).toHaveBeenCalledWith('lastPage', 'edit')
    expect(mutations.updateLastPage).toHaveBeenCalled()
  })
})
