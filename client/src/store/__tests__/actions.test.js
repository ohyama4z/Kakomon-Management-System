import { createLocalVue, shallowMount } from '@vue/test-utils'
import fetchMock from 'fetch-mock'
import 'jest-fetch-mock'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import Vuex from 'vuex'
import actions, { convertCsvToObj } from '../actions'

const localVue = createLocalVue()

localVue.use(Vuex)

// netlifyIdentityの関数を使えるようにする
jest.mock('netlify-identity-widget')
netlifyIdentity.open = jest.fn()
netlifyIdentity.on = jest.fn().mockImplementation((event, callback) => {
  if (event === 'login') {
    callback()
  }
})

jest.mock('node-fetch', () => jest.fn())

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

const store = new Vuex.Store({
  state,
  actions
})

describe('action.js', () => {
  it('csvをオブジェクトにする関数が機能するか見る', () => {
    const csv = `src,name,birthday\n` + `aho,TARO,0616\n` + `\n` + `a,b,c\n`
    const result = {
      aho: {
        src: 'aho',
        name: 'TARO',
        birthday: '0616'
      },
      a: {
        src: 'a',
        name: 'b',
        birthday: 'c'
      }
    }
    expect(convertCsvToObj(csv)).toEqual(result)

    jest.clearAllMocks()
  })

  it('ブランチの一覧を取得する', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    fetchMock.get('http://localhost:8085/.netlify/git/github/branches', {
      status: 200,
      body: [
        {
          name: 'master',
          commit: {
            sha: 'sha1'
          }
        },
        {
          name: 'branch1',
          commit: {
            sha: 'sha2'
          }
        }
      ]
    })

    const commit = jest.fn()
    const branches = {
      master: 'sha1',
      branch1: 'sha2'
    }

    await actions.getBranches({ commit, state })
    expect(commit).toHaveBeenNthCalledWith(1, 'setBranchesStatus', {
      path: 'branches',
      status: 'loading'
    })
    expect(commit).toHaveBeenNthCalledWith(2, 'setBranches', { branches })

    jest.clearAllMocks()
  })

  it('コミットごとのファイルの状態を取得する(キャシュを使用しない場合)', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    fetchMock.get(
      'http://localhost:8085/.netlify/git/github/contents/metadatas?ref=commitSha',
      {
        status: 200,
        body: [
          {
            name: 'file1.csv',
            sha: 'sha1'
          },
          {
            name: 'file2.csv',
            sha: 'sha2'
          }
        ]
      }
    )

    const commitSha = 'commitSha'
    const dispatch = jest.fn()
    const commit = jest.fn()
    const payloadForSetCommitStatus = { sha: commitSha, status: 'loading' }
    const commitData = {
      'file1.csv': 'sha1',
      'file2.csv': 'sha2'
    }
    const payloadForSetCommit = {
      sha: commitSha,
      data: commitData
    }

    await actions.getCommit({ dispatch, commit, state }, commitSha)
    expect(commit).toHaveBeenNthCalledWith(
      1,
      'setCommitStatus',
      payloadForSetCommitStatus
    )
    expect(localStorage.getItem).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(commit).toHaveBeenNthCalledWith(2, 'setCommit', payloadForSetCommit)
    expect(localStorage.setItem).toHaveBeenCalled()

    fetchMock.restore()
    localStorage.setItem.mockClear()
    jest.clearAllMocks()
  })

  it('コミットごとのファイルの状態を取得する(localStorageのキャシュを使用)', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    const commitSha = 'commitSha'
    const dispatch = jest.fn()
    const commit = jest.fn()
    const payloadForSetCommitStatus = { sha: commitSha, status: 'loading' }
    localStorage.commitSha = JSON.stringify({
      'file1.csv': 'sha1',
      'file2.csv': 'sha2'
    })
    const payloadForSetCommit = {
      sha: commitSha,
      data: JSON.parse(localStorage[commitSha])
    }

    await actions.getCommit({ dispatch, commit, state }, commitSha)
    expect(commit).toHaveBeenNthCalledWith(
      1,
      'setCommitStatus',
      payloadForSetCommitStatus
    )
    expect(localStorage.getItem).toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(commit).toHaveBeenNthCalledWith(2, 'setCommit', payloadForSetCommit)
    expect(localStorage.setItem).not.toHaveBeenCalled()

    localStorage.setItem.mockClear()
    jest.clearAllMocks()
  })

  it('コミットごとのファイルの状態を取得する(stateのキャッシュを使用)', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    const commitSha = 'commitSha'
    const dispatch = jest.fn()
    const commit = jest.fn()
    const payloadForSetCommitStatus = { sha: commitSha, status: 'loading' }
    state.commits = {
      commitSha: {
        status: 'loaded',
        data: {
          'file1.csv': 'sha1',
          'file2.csv': 'sha2'
        }
      }
    }

    await actions.getCommit({ dispatch, commit, state }, commitSha)
    expect(commit).not.toHaveBeenCalledWith(
      'setCommitStatus',
      payloadForSetCommitStatus
    )
    expect(localStorage.getItem).not.toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalled()
    expect(localStorage.setItem).not.toHaveBeenCalled()

    localStorage.setItem.mockClear()
    jest.clearAllMocks()
  })

  it('branchを選択した際にbranchの情報、コミット情報を取得するactionを走らせる', async () => {
    shallowMount(actions, {
      localVue,
      store
    })
    state.branches = {
      status: 'loaded',
      data: { master: 'sha1' }
    }
    const dispatch = jest.fn()
    const commit = jest.fn()
    const branchName = 'master'

    await actions.selectBranch({ dispatch, commit }, branchName)
    expect(commit).toHaveBeenCalledWith('setCurrentBranch', branchName)
    expect(dispatch).toHaveBeenCalledTimes(2)

    jest.clearAllMocks()
  })

  it('ファイルごとのshaからファイル情報を取得する(キャシュを使用しない場合)', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    fetchMock.get(
      'http://localhost:8085/.netlify/git/github/git/blobs/fileSha',
      {
        status: 200,
        body: {
          content: 'content1',
          sha: 'sha1'
        }
      }
    )

    const commit = jest.fn()
    const fileSha = 'fileSha'
    const payload = {
        sha: fileSha,
        data: {}
    }

    await actions.getContentMetadata({ commit, state }, fileSha)
    expect(commit).toHaveBeenNthCalledWith(1, 'setContentMetadataStatus', {
      sha: fileSha,
      status: 'loading'
    })
    expect(commit).toHaveBeenNthCalledWith(2, 'setContentMetadata', payload)
    expect(localStorage.setItem).toHaveBeenCalled()

    fetchMock.restore()
    localStorage.setItem.mockClear()
    jest.clearAllMocks()
  })
})
