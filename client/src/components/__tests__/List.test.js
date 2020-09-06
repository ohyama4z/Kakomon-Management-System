import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import List from '../List'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuikit)

describe('Preview.vue', () => {
  let state
  let mutations
  beforeEach(() => {
    state = {
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
      displayedFiles: [],
      changedFiles: {},
      selectedFiles: []
    }

    mutations = {
      updateChangedFileIndex: jest.fn(),
      setSelectedFiles: jest.fn()
    }
    jest.clearAllMocks()
  })

  it('stateからファイル一覧とその情報を取得する', () => {
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
    const store = new Vuex.Store({
      state,
      mutations
    })
    const wrapper = shallowMount(List, {
      store,
      localVue
    })
    const result = state.changedFiles
    expect(wrapper.vm.files).toEqual(result)
  })

  it('チェックボックスにチェックするとstateが更新される', async () => {
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
    const store = new Vuex.Store({
      state,
      mutations
    })
    const wrapper = shallowMount(List, {
      store,
      localVue
    })

    const checkbox = wrapper.findAll('input[type="checkbox"]').at(0)
    checkbox.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(mutations.setSelectedFiles).toHaveBeenCalled()
  })

  it('表のindex欄に入力することでstateを更新する', async () => {
    state.changedFiles = {
      'dir/file1.jpg': {
        subj: '数学',
        year: '2000',
        tool_type: '勉強用',
        period: '前期定期',
        content_type: 'ノート',
        author: 'おまえ',
        image_index: '001'
      }
    }
    const store = new Vuex.Store({
      state,
      mutations
    })
    const wrapper = shallowMount(List, {
      store,
      localVue
    })

    const indexInput = wrapper.findAll('input[type="number"]').at(0)
    indexInput.setValue('1')
    indexInput.trigger('change')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(mutations.updateChangedFileIndex).toHaveBeenCalled()
  })

  it('stateのselectedFilesに変更が加わるとローカルの変数も更新する', async () => {
    state.changedFiles = {
      'dir/file1.jpg': {
        subj: '数学',
        year: '2000',
        tool_type: '勉強用',
        period: '前期定期',
        content_type: 'ノート',
        author: 'おまえ',
        image_index: '001'
      }
    }
    const store = new Vuex.Store({
      state,
      mutations
    })
    const wrapper = shallowMount(List, {
      store,
      localVue
    })

    state.selectedFiles = ['dir/file1.jpg']
    await flushPromises()
    expect(wrapper.vm.selectedFiles).toEqual(['dir/file1.jpg'])
  })
})
