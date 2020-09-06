import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import { Button, ButtonLink } from 'vuikit/lib/button'
import { IconButton } from 'vuikit/lib/icon'
import { Modal } from 'vuikit/lib/modal'
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
      },
      selectedFiles: []
    }

    getters = {
      currentBranchMetadatas: () => ({
        status: 'loaded',
        data: {
          src1: {
            src: 'src1',
            subj: 'subj',
            year: 'year',
            content_type: 'content_type',
            tool_type: 'tool_type',
            period: 'period'
          }
        }
      }),
      subjects: () => []
    }

    mutations = {
      updateLastPage: jest.fn(),
      setChangedFiles: jest.fn()
    }

    actions = {
      updateCurrentUser: jest.fn(),
      getBranches: jest.fn(),
      selectBranch: jest.fn(),
      getCommit: jest.fn(),
      postCommitCsv: jest.fn()
    }
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('ページが読み込まれたときにbranchの取得,及びファイルの取得を行う', async () => {
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })

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

    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
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

  it('ブランチ一覧の取得中にはロード中表示にする', async () => {
    state.currentBranch = 'master'
    state.commits = {
      master: {
        status: 'loaded'
      }
    }
    state.branches.status = 'loading'

    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue
    })

    await flushPromises()
    expect(wrapper.vm.isLoadingFiles).toBe(true)
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)
  })

  it('コミット情報の取得中にはロード中表示にする', async () => {
    state.currentBranch = 'master'
    state.commits = {
      master: {
        status: 'loading'
      }
    }
    state.branches.status = 'loaded'

    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue
    })

    await flushPromises()
    expect(wrapper.vm.isLoadingFiles).toBe(true)
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)
  })

  it('gettersでサイドバー情報が取れていない間はロード中表示にする', async () => {
    getters.currentBranchMetadatas = () => ({
      data: {},
      status: 'loading'
    })
    state.currentBranch = 'master'
    state.commits = {
      master: {
        status: 'loaded'
      }
    }
    state.branches.status = 'loaded'

    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })

    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue
    })

    await flushPromises()
    expect(wrapper.vm.isLoadingFiles).toBe(false)
    expect(wrapper.vm.isLoading).toBe(true)
    expect(wrapper.findComponent(Spinner).exists()).toBe(true)
  })

  it('"編集内容を反映"ボタンを押すとstateにファイルごとの変更情報を置く', async () => {
    state.changedFiles = {
      'dir/file1.jpg': {
        subj: '数学',
        year: '2000',
        tool_type: '勉強用',
        period: '前期定期',
        content_type: 'ノート',
        author: 'おまえ'
      }
    }
    state.selectedFiles = ['dir/file1.jpg']
    const stubs = {
      VkButton: Button
    }
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
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
      .filter(w => w.text() === '編集内容を反映')
      .at(0)

    subjInput.setValue('数学')
    yearInput.setValue('2000')
    toolTypeInput.setValue('勉強用')
    periodInput.setValue('前期定期')
    authorInput.setValue('おまえ')
    await new Promise(resolve => setTimeout(resolve, 5))
    const contentTypeInput = wrapper.findAll('select').at(2)
    contentTypeInput.setValue('ノート')
    await new Promise(resolve => setTimeout(resolve, 5))

    expect(wrapper.vm.isSellectedAll).toBeTruthy()
    commitButton.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(mutations.setChangedFiles).toHaveBeenCalled()
  })

  it('Navbarのログアウトが押されるとログアウトの処理を行う', async () => {
    const stubs = {
      VkButton: Button
    }
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
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

  it('コミットボタンを押すと確認モーダルを出し、"はい"を押すとコミットするactionを呼ぶ', async () => {
    state.changedFiles = {
      'dir/file1.jpg': {
        subj: '数学',
        year: '2000',
        tool_type: '勉強用',
        period: '前期定期',
        content_type: 'ノート',
        author: 'おまえ'
      }
    }

    const stubs = {
      VkButton: Button,
      VkButtonLink: ButtonLink,
      VkModal: Modal
    }
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })

    await flushPromises()
    const commitButton = wrapper
      .findAllComponents(ButtonLink)
      .filter(w => w.text() === 'コミット')
      .at(0)
    commitButton.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(wrapper.vm.isModalOpened).toBe(true)
    const acceptButton = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === 'はい')
      .at(0)
    acceptButton.trigger('click')
    await flushPromises()
    expect(actions.postCommitCsv).toHaveBeenCalled()
  })

  it('コミットボタンを押すと確認モーダルを出し、"キャンセル"を押すと閉じる', async () => {
    state.changedFiles = {
      'dir/file1.jpg': {
        subj: '数学',
        year: '2000',
        tool_type: '勉強用',
        period: '前期定期',
        content_type: 'ノート',
        author: 'おまえ'
      }
    }

    const stubs = {
      VkButton: Button,
      VkButtonLink: ButtonLink,
      VkModal: Modal
    }
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })

    await flushPromises()
    const commitButton = wrapper
      .findAllComponents(ButtonLink)
      .filter(w => w.text() === 'コミット')
      .at(0)
    commitButton.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(wrapper.vm.isModalOpened).toBe(true)
    const cancelButton = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === 'キャンセル')
      .at(0)
    cancelButton.trigger('click')
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(wrapper.vm.isModalOpened).toBe(false)
    expect(actions.postCommitCsv).not.toHaveBeenCalled()
  })

  it('プレビューボタンを押すと画像表示モードに、リストボタンを押すとリスト表示モードに切り替える', async () => {
    state.changedFiles = {
      'dir/file1.jpg': {
        subj: '数学',
        year: '2000',
        tool_type: '勉強用',
        period: '前期定期',
        content_type: 'ノート',
        author: 'おまえ'
      }
    }

    const stubs = {
      VkButton: Button,
      VkButtonLink: ButtonLink,
      VkModal: Modal,
      VkIconButton: IconButton
    }
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    const wrapper = shallowMount(Edit, {
      store,
      router,
      localVue,
      stubs
    })

    await flushPromises()
    expect(wrapper.vm.displayMode).toBe('list')
    const previewButton = wrapper.findAllComponents(IconButton).at(0)
    previewButton.trigger('click')
    expect(wrapper.vm.displayMode).toBe('preview')
    const listButton = wrapper.findAllComponents(IconButton).at(1)
    listButton.trigger('click')
    expect(wrapper.vm.displayMode).toBe('list')
  })
})
