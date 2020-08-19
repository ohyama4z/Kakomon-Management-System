import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import getters from '../getters'

const localVue = createLocalVue()

localVue.use(Vuex)

const state = {
  currentBranch: '',
  commits: {},
  contentMetadatas: {},
  branches: {
    status: 'unrequested',
    data: {}
  }
}

const store = new Vuex.Store({
  state
})

describe('getters.js', () => {
  it('stateにあるファイルのobjectデータをサイドバー用データ構造に加工しやすいように変形して返す', () => {
    state.currentBranch = 'master'
    state.branches = {
      status: 'loaded',
      data: {
        master: 'commitSha1'
      }
    }
    state.commits = {
      commitSha1: {
        status: 'loaded',
        data: {
          'file1.csv': 'fileSha1',
          'file2.csv': 'fileSha2'
        }
      }
    }
    state.contentMetadatas = {
      fileSha1: {
        status: 'loaded',
        data: {
          'file1-1.jpg': {
            src: 'file1-1.jpg'
          },
          'file1-2.jpg': {
            src: 'file1-2.jpg'
          }
        }
      },
      fileSha2: {
        status: 'loaded',
        data: {
          'file2-1.jpg': {
            src: 'file2-1.jpg'
          },
          'file2-2.jpg': {
            src: 'file2-2.jpg'
          }
        }
      }
    }

    shallowMount(getters, {
      localVue,
      store
    })

    const result = {
      'file1-1.jpg': {
        src: 'file1-1.jpg'
      },
      'file1-2.jpg': {
        src: 'file1-2.jpg'
      },
      'file2-1.jpg': {
        src: 'file2-1.jpg'
      },
      'file2-2.jpg': {
        src: 'file2-2.jpg'
      }
    }

    expect(getters.currentBranchMetadatas(state)).toEqual(result)
  })
})
