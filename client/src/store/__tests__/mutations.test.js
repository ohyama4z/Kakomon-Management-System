import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import mutations from '../mutations'

const localVue = createLocalVue()

localVue.use(Vuex)

const state = {
  lastPage: '',
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

describe('mutations.js', () => {
  it('ユーザーがeditページを読み込んだ際のbranchの書き換え,commitsの書き換え,contentMetadatasの書き換えまでの一連の流れ', () => {
    shallowMount(mutations, {
      localVue,
      store
    })

    state.currentBranch = 'master'
    const payloadForSetBranches = {
      branches: {
        master: 'commitSha1'
      }
    }
    const resultForSetBranches = {
      status: 'loaded',
      data: {
        master: 'commitSha1'
      }
    }

    mutations.setBranches(state, payloadForSetBranches)
    expect(state.branches).toEqual(resultForSetBranches)

    const commitSha = state.branches.data[state.currentBranch]
    const payloadForSetCommit = {
      sha: commitSha,
      data: {
        'file1.csv': 'fileSha1',
        'file2.csv': 'fileSha2'
      }
    }
    const resultForSetCommit = {
      commitSha1: {
        status: 'loaded',
        data: {
          'file1.csv': 'fileSha1',
          'file2.csv': 'fileSha2'
        }
      }
    }

    mutations.setCommit(state, payloadForSetCommit)
    expect(state.commits).toEqual(resultForSetCommit)

    const currentFile = 'file1.csv'
    const fileSha = state.commits[commitSha].data[currentFile]
    const payloadForSetContentMetaData = {
      sha: fileSha,
      data: {
        'file1-1.jpg': {
          src: 'file1-1.jpg'
        },
      }
    }
    const resultForSetContentMetaData = {
      fileSha1: {
        status: 'loaded',
        data: {
          'file1-1.jpg': {
            src: 'file1-1.jpg'
          },
        }
      }
    }

    mutations.setContentMetadata(state, payloadForSetContentMetaData)
    expect(state.contentMetadatas).toEqual(resultForSetContentMetaData)
  })
})
