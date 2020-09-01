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
import { Iconnav, IconnavItem } from 'vuikit/lib/iconnav'
import { Spinner } from 'vuikit/lib/spinner'
import Navbar from '../../components/Navbar'
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
      getBranches: jest.fn(),
      createBranch: jest.fn(),
      upload: jest.fn()
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

  it('表示するbranch一覧はmaster branch以外のbranchを参照する', async () => {
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
    await flushPromises()

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
    await new Promise(resolve => setTimeout(resolve, 5))
    const branch1Button = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === 'branch1')
    branch1Button.at(0).trigger('click')
    expect(wrapper.vm.branchName).toBe('branch1')
  })

  it('ファイルを選択するとファイル名が表示され、アイコンを押すと消える', async () => {
    const stubs = {
      VkIconnav: Iconnav,
      VkIconnavItem: IconnavItem
    }
    const wrapper = shallowMount(Upload, {
      store,
      router,
      localVue,
      stubs
    })
    global.URL.createObjectURL = jest.fn(() => 'aaa')

    await flushPromises()

    // ファイルの入力、以下よりコピペ
    // https://stackoverflow.com/questions/48993134/how-to-test-input-file-with-jest-and-vue-test-utils
    let localImageInputValue = ''
    const localImageInput = wrapper.find('input[type="file"]')
    const localImageInputFilesGet = jest.fn()
    const localImageInputValueGet = jest
      .fn()
      .mockReturnValue(localImageInputValue)
    const localImageInputValueSet = jest.fn().mockImplementation(v => {
      localImageInputValue = v
    })
    Object.defineProperty(localImageInput.element, 'files', {
      get: localImageInputFilesGet
    })
    Object.defineProperty(localImageInput.element, 'value', {
      get: localImageInputValueGet,
      set: localImageInputValueSet
    })

    localImageInputFilesGet.mockReturnValue([{ name: 'hoge.png' }])

    localImageInput.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(wrapper.vm.uploadedFiles).toEqual({ 'hoge.png': 'aaa' })
    const imageDiv = wrapper
      .findAll('div')
      .filter(w => w.text() === 'hoge.png')
      .at(0)
    expect(imageDiv.exists()).toBe(true)

    const imageDivIcon = wrapper.findAllComponents(IconnavItem).at(0)
    imageDivIcon.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(wrapper.vm.uploadedFiles).toEqual({})
    const deletedImageDiv = wrapper
      .findAll('div')
      .filter(w => w.text() === 'hoge.png')
    expect(deletedImageDiv.exists()).toBe(false)
  })

  it('branch新規作成時に既存のbranchと同じ名前を入力すると怒られる', async () => {
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
    wrapper.findAll('input').at(0).setValue('branch')
    // ユーザ入力をしたあとは少し時間を置く
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(wrapper.vm.newBranch).toBe('branch')
    const createBranchButton = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === '作成')
      .at(0)
    expect(wrapper.vm.isNewBranch).toBeTruthy()
    createBranchButton.trigger('click')
    await flushPromises()
    expect(actions.createBranch).toHaveBeenCalled()
    expect(actions.getBranches).toHaveBeenCalled()
  })

  it('作成ボタンを押しブランチ新規作成のactionを走らせる', async () => {
    state.branches = {
      status: 'loaded',
      data: {
        master: 'sha1',
        branch: 'sha2'
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
    wrapper.findAll('input').at(0).setValue('branch')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(wrapper.vm.newBranch).toBe('branch')
    expect(wrapper.vm.isExisted).toBeTruthy()
    expect(wrapper.vm.isNewBranch).toBeFalsy()
  })

  it('アップロードボタンを押すとcommitを作成するactionsが呼ばれる', async () => {
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
    global.URL.createObjectURL = jest.fn(() => 'aaa')

    await flushPromises()

    // 初期状態ではボタンはdisabled
    expect(wrapper.vm.isDisabled).toBeTruthy()

    // branchの選択
    wrapper.findAllComponents(Button).at(3).trigger('click')
    await new Promise(resolve => setTimeout(resolve, 5))
    const branch1Button = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === 'branch1')
    branch1Button.at(0).trigger('click')

    // ファイルの入力
    let localImageInputValue = ''
    const localImageInput = wrapper.find('input[type="file"]')
    const localImageInputFilesGet = jest.fn()
    const localImageInputValueGet = jest
      .fn()
      .mockReturnValue(localImageInputValue)
    const localImageInputValueSet = jest.fn().mockImplementation(v => {
      localImageInputValue = v
    })
    Object.defineProperty(localImageInput.element, 'files', {
      get: localImageInputFilesGet
    })
    Object.defineProperty(localImageInput.element, 'value', {
      get: localImageInputValueGet,
      set: localImageInputValueSet
    })
    localImageInputFilesGet.mockReturnValue([{ name: 'hoge.png' }])
    localImageInput.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 5))

    // commit messageの入力
    const commitMessageInput = wrapper.find(
      'input[placeholder="コミットメッセージ"]'
    )
    commitMessageInput.setValue('aho')
    await new Promise(resolve => setTimeout(resolve, 5))

    // 各入力が変数に反映され、ボタンが押せるようになる
    expect(wrapper.vm.branchName).toBe('branch1')
    expect(wrapper.vm.uploadedFiles).toEqual({ 'hoge.png': 'aaa' })
    expect(wrapper.vm.commitMessage).toBe('aho')
    expect(wrapper.vm.isDisabled).toBeFalsy()

    const uploadButton = wrapper
      .findAllComponents(Button)
      .filter(w => w.text() === 'アップロード')
      .at(0)
    uploadButton.trigger('click')
    await flushPromises()

    expect(actions.upload).toHaveBeenCalled()
  })

  it('Navbarのログアウトが押されるとログアウトの処理を行う', async () => {
    const stubs = {
      VkButton: Button
    }

    const wrapper = shallowMount(Upload, {
      store,
      router,
      localVue,
      stubs
    })
    await flushPromises()
    wrapper.findComponent(Navbar).vm.$emit('before-logout')
    expect(localStorage.setItem).toHaveBeenCalledWith('lastPage', 'upload')
    expect(mutations.updateLastPage).toHaveBeenCalled()
  })
})
