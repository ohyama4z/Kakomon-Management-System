import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import Preview from '../Preview'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuikit)

const state = {
  currentUser: {
    token: {
      access_token: 'token'
    }
  },
  currentBranch: '',

  commits: {},
  contentMetadatas: {},

  branches: {
    status: 'unrequested',
    data: {}
  },

  imageDatas: {},
  imageShas: {},
  displayedFiles: []
}

const store = new Vuex.Store({
  state
})

describe('Preview.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stateから選択されたフォルダの画像ファイル一覧を取得する', () => {
    state.currentBranch = 'master'
    state.branches = {
      data: { master: 'commitSha' }
    }
    state.displayedFiles = ['dir/path1', 'dir/path2']
    state.imageShas = {
      commitSha: {
        dir: {
          data: {
            path1: 'sha1',
            path2: 'sha2'
          }
        }
      }
    }
    state.imageDatas = {
      sha1: { data: 'blob1' },
      sha2: { data: 'blob2' }
    }

    const wrapper = shallowMount(Preview, {
      store,
      localVue
    })

    const result = ['blob1', 'blob2']

    expect(wrapper.vm.images).toEqual(result)
  })
})
