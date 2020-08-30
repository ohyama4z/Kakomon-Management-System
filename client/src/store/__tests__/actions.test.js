import { createLocalVue, shallowMount } from '@vue/test-utils'
import merge from 'deepmerge'
import fetchMock from 'fetch-mock'
import 'jest-fetch-mock'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import Vuex from 'vuex'
import actions, {
  convertCsvToObj,
  convertObjToCsv,
  getCsvBlobSha
} from '../actions'

const localVue = createLocalVue()
const url = process.env.VUE_APP_URL

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
      access_token: '12345'
    },
    email: 'ahoge@gmail.com'
  },
  lastPage: '',
  currentBranch: '',

  commits: {},
  contentMetadatas: {},

  branches: {
    status: 'unrequested',
    data: {}
  },

  changedFiles: {
    'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg': {
      src: 'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg',
      subj: '倫理社会',
      tool_type: 'テスト',
      period: '前期定期',
      year: '2018',
      content_type: '',
      author: '',
      image_index: '',
      included_pages_num: '',
      fix_text: ''
    },
    'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg': {
      src: 'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg',
      subj: '',
      tool_type: '',
      period: '',
      year: '',
      content_type: '',
      author: '',
      image_index: '',
      included_pages_num: '',
      fix_text: ''
    },
    'tests/2018/テスト_2018_後期中間_論理回路i_問題001.jpg': {
      src: 'tests/2018/テスト_2018_後期中間_論理回路i_問題001.jpg:',
      subj: '算数',
      tool_type: '勉強用',
      period: '',
      year: '',
      content_type: '',
      author: '',
      image_index: '',
      included_pages_num: '',
      fix_text: ''
    }
  },

  setCommitCsv: {
    status: 'unrequested'
  },

  imageShas: {},
  imageDatas: {}
}

const store = new Vuex.Store({
  state,
  actions
})

describe('actions.js', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    fetchMock.restore()
  })
  it('csvをオブジェクトにする関数が機能するか見る', () => {
    const csv = `src,name,birthday\n` + `aho,TARO,0616\n` + `\n` + `a,b,c\n`
    const result = {
      aho: {
        src: 'aho',
        name: 'TARO',
        birthday: '0616',
        sha: {
          status: 'unrequested',
          data: {}
        }
      },
      a: {
        src: 'a',
        name: 'b',
        birthday: 'c',
        sha: {
          status: 'unrequested',
          data: {}
        }
      }
    }
    expect(convertCsvToObj(csv)).toEqual(result)
  })

  it('ブランチの一覧を取得する', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(`${url}/github/branches`, {
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
      ],
      headers
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

    const auth = 'Bearer 12345'
    expect(commit).toHaveBeenNthCalledWith(2, 'setBranches', { branches })
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
  })

  it('コミットごとのファイルの状態を取得する(キャシュを使用しない場合)', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(
      `${url}/github/contents/metadatas?ref=commitSha`,
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
        ],
        headers
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
    const auth = 'Bearer 12345'

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
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
  })

  it('コミットごとのファイルの状態を取得する(localStorageのキャッシュを使用)', async () => {
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
  })

  it('ファイルごとのshaからファイル情報を取得する(キャシュを使用しない場合)', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(
      `${url}/github/git/blobs/fileSha`,
      {
        status: 200,
        body: {
          content: 'content1',
          sha: 'sha1'
        },
        headers
      }
    )

    const commit = jest.fn()
    const fileSha = 'fileSha'
    const payload = {
      sha: fileSha,
      data: {}
    }
    const auth = 'Bearer 12345'

    await actions.getContentMetadata({ commit, state }, fileSha)
    expect(commit).toHaveBeenNthCalledWith(1, 'setContentMetadataStatus', {
      sha: fileSha,
      status: 'loading'
    })
    expect(commit).toHaveBeenNthCalledWith(2, 'setContentMetadata', payload)
    expect(localStorage.setItem).toHaveBeenCalled()
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
  })

  it('ファイルごとのshaからファイル情報を取得する(localStorageのキャッシュを使用する)', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    const commit = jest.fn()
    const fileSha = 'fileSha'
    localStorage[fileSha] = JSON.stringify({
      status: 'loaded',
      data: {
        'file1.jpg': { src: 'file1.jpg' }
      }
    })
    const payload = {
      sha: fileSha,
      data: JSON.parse(localStorage[fileSha])
    }

    await actions.getContentMetadata({ commit, state }, fileSha)
    expect(commit).toHaveBeenNthCalledWith(1, 'setContentMetadataStatus', {
      sha: fileSha,
      status: 'loading'
    })
    expect(commit).toHaveBeenNthCalledWith(2, 'setContentMetadata', payload)
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('ファイルごとのshaからファイル情報を取得する(stateのキャッシュを使用する)', async () => {
    shallowMount(actions, {
      localVue,
      store
    })

    state.contentMetadatas = {
      fileSha: {
        status: 'loaded',
        data: {
          'file1.jpg': { src: 'file1.jpg' }
        }
      }
    }

    const commit = jest.fn()
    const fileSha = 'fileSha'

    await actions.getContentMetadata({ commit, state }, fileSha)
    expect(commit).not.toHaveBeenCalledWith('setContentMetadataStatus', {
      sha: fileSha,
      status: 'loading'
    })
    expect(localStorage.getItem).not.toHaveBeenCalled()
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('objectToCsvが機能するかテスト', () => {
    const objarr = [
      {
        src: 'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg',
        subj: '倫理社会',
        tool_type: 'テスト',
        period: '前期定期',
        year: '2018',
        content_type: '',
        author: '',
        image_index: '',
        included_pages_num: '',
        fix_text: ''
      },
      {
        src: 'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg',
        subj: '',
        tool_type: '',
        period: '',
        year: '',
        content_type: '',
        author: '',
        image_index: '',
        included_pages_num: '',
        fix_text: ''
      }
    ]
    const result =
      `src,subj,tool_type,period,year,content_type,author,image_index,included_pages_num,fix_text\n` +
      `scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg,倫理社会,テスト,前期定期,2018,,,,,\n` +
      `scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg,,,,,,,,,`
    expect(convertObjToCsv(objarr)).toEqual(result)
  })

  it('setCommitCsv', async () => {
    state.currentBranch = 'cmstest'
    const branchName = state.currentBranch
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    // ref取得
    fetchMock.get(
      `${url}/github/git/refs/heads/${branchName}`,
      {
        status: 200,
        body: {
          ref: 'refs/heads/cmstest',
          node_id: 'MDM6UmVmMTk3ODY2NDY0OnJlZnMvaGVhZHMvY21zdGVzdA==',
          url:
            'https://api.github.com/repos/satackey/test-preps/git/refs/heads/cmstest',
          object: {
            sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9',
            type: 'commit',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/commits/58c821fea857ca1e270c3b34f5bc97db64c84fc9'
          }
        }
      },
      headers
    )

    const commitsHash = '58c821fea857ca1e270c3b34f5bc97db64c84fc9'

    // commitの取得
    fetchMock.get(
      `${url}/github/commits/${commitsHash}`,
      {
        status: 200,
        body: {
          sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9',
          node_id:
            'MDY6Q29tbWl0MTk3ODY2NDY0OjU4YzgyMWZlYTg1N2NhMWUyNzBjM2IzNGY1YmM5N2RiNjRjODRmYzk=',
          commit: {
            author: {
              name: 'test',
              email: 'hoge@gmail.com',
              date: '2020-08-21T12:36:15Z'
            },
            committer: {
              name: 'test',
              email: 'hoge@gmail.com',
              date: '2020-08-21T12:36:15Z'
            },
            message: '2020-08-21T21:36:15+09:00',
            tree: {
              sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6',
              url:
                'https://api.github.com/repos/satackey/test-preps/git/trees/2192c7b798b4d4479e942f4d065780b44a04dbd6'
            },
            url:
              'https://api.github.com/repos/satackey/test-preps/git/commits/58c821fea857ca1e270c3b34f5bc97db64c84fc9',
            comment_count: 0,
            verification: {
              verified: false,
              reason: 'unsigned',
              signature: null,
              payload: null
            }
          },
          url:
            'https://api.github.com/repos/satackey/test-preps/commits/58c821fea857ca1e270c3b34f5bc97db64c84fc9',
          html_url:
            'https://github.com/satackey/test-preps/commit/58c821fea857ca1e270c3b34f5bc97db64c84fc9',
          comments_url:
            'https://api.github.com/repos/satackey/test-preps/commits/58c821fea857ca1e270c3b34f5bc97db64c84fc9/comments',
          author: {
            login: 'hogehogefuga',
            id: 8703329,
            node_id: 'MDQ6VXNlcjg3MDMzMjk=',
            avatar_url: 'https://avatars3.githubusercontent.com/u/8703329?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/hogehogefuga',
            html_url: 'https://github.com/hogehogefuga',
            followers_url:
              'https://api.github.com/users/hogehogefuga/followers',
            following_url:
              'https://api.github.com/users/hogehogefuga/following{/other_user}',
            gists_url:
              'https://api.github.com/users/hogehogefuga/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/hogehogefuga/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/hogehogefuga/subscriptions',
            organizations_url: 'https://api.github.com/users/hogehogefuga/orgs',
            repos_url: 'https://api.github.com/users/hogehogefuga/repos',
            events_url:
              'https://api.github.com/users/hogehogefuga/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/hogehogefuga/received_events',
            type: 'User',
            site_admin: false
          },
          committer: {
            login: 'hogehogefuga',
            id: 8703329,
            node_id: 'MDQ6VXNlcjg3MDMzMjk=',
            avatar_url: 'https://avatars3.githubusercontent.com/u/8703329?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/hogehogefuga',
            html_url: 'https://github.com/hogehogefuga',
            followers_url:
              'https://api.github.com/users/hogehogefuga/followers',
            following_url:
              'https://api.github.com/users/hogehogefuga/following{/other_user}',
            gists_url:
              'https://api.github.com/users/hogehogefuga/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/hogehogefuga/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/hogehogefuga/subscriptions',
            organizations_url: 'https://api.github.com/users/hogehogefuga/orgs',
            repos_url: 'https://api.github.com/users/hogehogefuga/repos',
            events_url:
              'https://api.github.com/users/hogehogefuga/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/hogehogefuga/received_events',
            type: 'User',
            site_admin: false
          },
          parents: [
            {
              sha: '184dc414ac5f556bc32e9fc07dc0ee40aff71152',
              url:
                'https://api.github.com/repos/satackey/test-preps/commits/184dc414ac5f556bc32e9fc07dc0ee40aff71152',
              html_url:
                'https://github.com/satackey/test-preps/commit/184dc414ac5f556bc32e9fc07dc0ee40aff71152'
            }
          ],
          stats: {
            total: 0,
            additions: 0,
            deletions: 0
          },
          files: []
        }
      },
      headers
    )

    // blobの作成
    fetchMock.post(
      `${url}/github/git/blobs?ref=${branchName}`,
      {
        status: 200,
        body: {
          sha: '8c187d7baccab1c2abf487e09051f0ee8cb04c18',
          url:
            'https://api.github.com/repos/satackey/test-preps/git/blobs/8c187d7baccab1c2abf487e09051f0ee8cb04c18'
        }
      },
      headers
    )

    // treeの作成
    fetchMock.post(`${url}/github/git/trees`, {
      status: 200,
      body: {
        sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6',
        url:
          'https://api.github.com/repos/satackey/test-preps/git/trees/2192c7b798b4d4479e942f4d065780b44a04dbd6',
        tree: [
          {
            path: '.circleci',
            mode: '040000',
            type: 'tree',
            sha: 'e78a725a4d3309a27794e0492b48da41c572035c',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/trees/e78a725a4d3309a27794e0492b48da41c572035c'
          },
          {
            path: '.github',
            mode: '040000',
            type: 'tree',
            sha: 'e45de82cfd0a76a71b32fbdc890145d46a223fe3',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/trees/e45de82cfd0a76a71b32fbdc890145d46a223fe3'
          },
          {
            path: '.gitignore',
            mode: '100644',
            type: 'blob',
            sha: '371774330ed12a8140bbbe77bcb278cbdc0fb17a',
            size: 622,
            url:
              'https://api.github.com/repos/satackey/test-preps/git/blobs/371774330ed12a8140bbbe77bcb278cbdc0fb17a'
          },
          {
            path: '.vscode',
            mode: '040000',
            type: 'tree',
            sha: '4e1084651b521e37c32f9d15a43657fe4de68702',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/trees/4e1084651b521e37c32f9d15a43657fe4de68702'
          },
          {
            path: 'README.md',
            mode: '100644',
            type: 'blob',
            sha: 'cdda0cf26096005c0307a1fc25e3ad8c9a90d9b4',
            size: 11,
            url:
              'https://api.github.com/repos/satackey/test-preps/git/blobs/cdda0cf26096005c0307a1fc25e3ad8c9a90d9b4'
          },
          {
            path: 'metadatas',
            mode: '040000',
            type: 'tree',
            sha: 'b01117334bf8d1d98e623abd1bb955875851814c',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/trees/b01117334bf8d1d98e623abd1bb955875851814c'
          },
          {
            path: 'scanned',
            mode: '040000',
            type: 'tree',
            sha: '991f22994b75373529dbe374a61617ad9ea55404',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/trees/991f22994b75373529dbe374a61617ad9ea55404'
          },
          {
            path: 'studies',
            mode: '040000',
            type: 'tree',
            sha: 'bfa78578cfff5aaed51123f3d7d1c35153ff72a5',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/trees/bfa78578cfff5aaed51123f3d7d1c35153ff72a5'
          },
          {
            path: 'test.csv',
            mode: '100644',
            type: 'blob',
            sha: '8c187d7baccab1c2abf487e09051f0ee8cb04c18',
            size: 293,
            url:
              'https://api.github.com/repos/satackey/test-preps/git/blobs/8c187d7baccab1c2abf487e09051f0ee8cb04c18'
          },
          {
            path: 'tests',
            mode: '040000',
            type: 'tree',
            sha: 'cc611fe7719cd4fc2ebfbb8adef3f20daf2eea7b',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/trees/cc611fe7719cd4fc2ebfbb8adef3f20daf2eea7b'
          }
        ],
        truncated: false
      },
      headers
    })

    // commitの作成
    fetchMock.post(
      `${url}/github/git/commits?ref=${branchName}`,
      {
        status: 200,
        body: {
          sha: '1ce0d6ec02ff4a364245a4f435cdf9a7119507a4',
          node_id:
            'MDY6Q29tbWl0MTk3ODY2NDY0OjFjZTBkNmVjMDJmZjRhMzY0MjQ1YTRmNDM1Y2RmOWE3MTE5NTA3YTQ=',
          url:
            'https://api.github.com/repos/satackey/test-preps/git/commits/1ce0d6ec02ff4a364245a4f435cdf9a7119507a4',
          html_url:
            'https://github.com/satackey/test-preps/commit/1ce0d6ec02ff4a364245a4f435cdf9a7119507a4',
          author: {
            name: 'test',
            email: 'hoge@gmail.com',
            date: '2020-08-21T12:43:45Z'
          },
          committer: {
            name: 'test',
            email: 'hoge@gmail.com',
            date: '2020-08-21T12:43:45Z'
          },
          tree: {
            sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/trees/2192c7b798b4d4479e942f4d065780b44a04dbd6'
          },
          message: '2020-08-21T21:43:45+09:00',
          parents: [
            {
              sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9',
              url:
                'https://api.github.com/repos/satackey/test-preps/git/commits/58c821fea857ca1e270c3b34f5bc97db64c84fc9',
              html_url:
                'https://github.com/satackey/test-preps/commit/58c821fea857ca1e270c3b34f5bc97db64c84fc9'
            }
          ],
          verification: {
            verified: false,
            reason: 'unsigned',
            signature: null,
            payload: null
          }
        }
      },
      headers
    )

    // refの更新
    fetchMock.patch(
      `${url}/github/git/refs/heads/${branchName}`,
      {
        status: 200,
        body: {
          ref: 'refs/heads/cmstest',
          node_id: 'MDM6UmVmMTk3ODY2NDY0OnJlZnMvaGVhZHMvY21zdGVzdA==',
          url:
            'https://api.github.com/repos/satackey/test-preps/git/refs/heads/cmstest',
          object: {
            sha: '1ce0d6ec02ff4a364245a4f435cdf9a7119507a4',
            type: 'commit',
            url:
              'https://api.github.com/repos/satackey/test-preps/git/commits/1ce0d6ec02ff4a364245a4f435cdf9a7119507a4'
          }
        }
      },
      headers
    )

    const postAuth = 'Bearer 12345'
    const userName = 'ahoge'

    const csvSha = '02f495e08b05c5b5b71c90a9c7c0f906a818aa80'
    state.contentMetadatas = {
      '02f495e08b05c5b5b71c90a9c7c0f906a818aa80': {
        data: {
          'tests/2018/テスト_2018_後期中間_論理回路i_問題001.jpg': {
            author: '',
            content_type: '',
            fix_text: '',
            image_index: '',
            included_pages_num: '',
            period: '',
            src: 'tests/2018/テスト_2018_後期中間_論理回路i_問題001.jpg:',
            subj: '算数',
            tool_type: '勉強用',
            year: ''
          },
          'tests/2018/テスト_2018_後期中間_論理回路i_問題002.jpg': {
            author: '',
            content_type: '問題',
            fix_text: '',
            image_index: '002',
            included_pages_num: '1',
            period: '後期中間',
            src: 'tests/2018/テスト_2018_後期中間_論理回路i_問題002.jpg',
            subj: '論理回路i',
            tool_type: 'テスト',
            year: '2018'
          }
        }
      }
    }

    const saveContentMetadatas = merge({}, state.contentMetadatas[csvSha].data)

    await actions.postCommitCsv({ state })

    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      postAuth
    )
    expect(fetchMock.calls(undefined, 'GET')[1][1].headers.Authorization).toBe(
      postAuth
    )
    expect(fetchMock.calls(undefined, 'POST')[0][1].headers.Authorization).toBe(
      postAuth
    )
    expect(fetchMock.calls(undefined, 'POST')[1][1].headers.Authorization).toBe(
      postAuth
    )
    expect(fetchMock.calls(undefined, 'POST')[2][1].headers.Authorization).toBe(
      postAuth
    )

    const parsedBody = JSON.parse(fetchMock.calls(undefined, 'POST')[2][1].body)
    expect(parsedBody.author.name).toBe(userName)

    expect(
      fetchMock.calls(undefined, 'PATCH')[0][1].headers.Authorization
    ).toBe(postAuth)

    // stateが変更されていないか
    expect(state.contentMetadatas[csvSha].data).toEqual(saveContentMetadatas)
  })

  it('画像ファイルのshaを取得する(キャッシュなし)', async () => {
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(
      `${url}/github/contents/dir?ref=sha`,
      {
        status: 200,
        body: [
          { name: 'file1.jpg', sha: 'imageSha1' },
          { name: 'file2.jpg', sha: 'imageSha2' }
        ],
        headers
      }
    )

    shallowMount(actions, {
      localVue,
      store
    })

    const commit = jest.fn()
    const directoryPath = 'dir'
    const commitSha = 'sha'

    const payload = {
      directoryPath,
      commitSha,
      data: {
        'file1.jpg': 'imageSha1',
        'file2.jpg': 'imageSha2'
      }
    }
    const auth = 'Bearer 12345'

    await actions.getImageShas({ state, commit }, { directoryPath, commitSha })
    expect(commit).toHaveBeenCalledWith('setImageShas', payload)
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
  })

  it('画像ファイルのshaを取得する(stateキャッシュあり)', async () => {
    const commit = jest.fn()
    const directoryPath = 'dir'
    const commitSha = 'sha'
    state.imageShas = {
      sha: {
        dir: { status: 'loaded' }
      }
    }

    shallowMount(actions, {
      localVue,
      store
    })

    const payload = {
      directoryPath,
      commitSha,
      data: {
        'file1.jpg': 'imageSha1',
        'file2.jpg': 'imageSha2'
      }
    }

    await actions.getImageShas({ state, commit }, { directoryPath, commitSha })
    expect(commit).not.toHaveBeenCalledWith('setImageShas', payload)
  })

  it('ファイルのshaから画像データを取得する', async () => {
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    state.currentBranch = 'master'
    state.branches = {
      status: 'loaded',
      data: { master: 'commitSha' }
    }
    state.contentMetadatas = {
      fileSha: {
        status: 'loaded',
        data: {
          'dir/file1': { src: 'dir/file1' },
          'dir/file2': { src: 'dir/file2' }
        }
      }
    }
    state.imageShas = {
      commitSha: {
        dir: {
          data: {
            file1: 'sha1',
            file2: 'sha2'
          }
        }
      }
    }

    fetchMock.get(`${url}/github/git/blobs/sha1`, {
      status: 200,
      body: {
        content: '1b64'
      },
      headers
    })
    fetchMock.get(`${url}/github/git/blobs/sha2`, {
      status: 200,
      body: {
        content: '2b64'
      },
      headers
    })

    shallowMount(actions, {
      localVue,
      store
    })

    const commit = jest.fn()
    const dispatch = jest.fn()
    global.URL.createObjectURL = jest.fn()
    const auth = 'Bearer 12345'

    await actions.getImageDatas({ dispatch, state, commit }, 'fileSha')
    expect(commit).toHaveBeenNthCalledWith(1, 'setDisplayedFiles', [
      'dir/file1',
      'dir/file2'
    ])
    expect(dispatch).toHaveBeenCalledWith('getImageShas', {
      commitSha: 'commitSha',
      directoryPath: 'dir'
    })
    expect(commit).toHaveBeenCalledTimes(3)
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(fetchMock.calls(undefined, 'GET')[1][1].headers.Authorization).toBe(
      auth
    )
  })

  it('ブランチの新規作成', async () => {
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(
      `${url}/github/git/refs/heads/master`,
      {
        status: 200,
        body: {
          object: {
            sha: 'sha'
          }
        },
        headers
      }
    )

    fetchMock.post(`${url}/github/git/refs`, {
      status: 201
    })

    shallowMount(actions, {
      localVue,
      store
    })

    const commit = jest.fn()
    const branch = 'newBranch'
    const auth = 'Bearer 12345'
    const body = JSON.stringify({ ref: `refs/heads/newBranch`, sha: `sha` })

    await actions.createBranch({ state, commit }, branch)
    expect(commit).toHaveBeenCalledWith('setBranchesStatus', {
      path: 'branches',
      status: 'loading'
    })
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(fetchMock.calls(undefined, 'POST')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(fetchMock.calls(undefined, 'POST')[0][1].body).toEqual(body)
  })

  it('新しいファイルのアップロード', async () => {
    state.branches = {
      data: {
        newBranch: 'commitSha'
      }
    }

    shallowMount(actions, {
      localVue,
      store
    })

    const payload = {
      branch: 'newBranch',
      files: 'files',
      commitMessage: 'commitMessage'
    }
    const dispatch = jest.fn()
    const createCommitPayload = {
      commitSha: 'commitSha',
      branch: 'newBranch',
      files: 'files',
      commitMessage: 'commitMessage'
    }

    await actions.upload({ state, dispatch }, payload)
    expect(dispatch).toHaveBeenCalledWith('createCommit', createCommitPayload)
  })

  it('commitの作成', async () => {
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(
      `${url}/github/git/commits/commitSha`,
      {
        status: 200,
        body: {
          tree: {
            sha: 'baseTreeSha'
          }
        },
        headers
      }
    )

    global.FileReader = function () {
      this.readAsDataURL = () => {
        this.result = 'data:hoge;base64,fugofugo'
        this.onload()
      }
    }
    const blob = new Blob(['hello'], { type: 'text/plain' })
    fetchMock.mock(
      'blobUri',
      {
        body: blob
      },
      {
        sendAsJson: false
      }
    )

    fetchMock.post(
      `${url}/github/git/blobs?ref=newBranch`,
      {
        status: 201,
        body: { sha: 'blobSha' },
        headers
      }
    )

    fetchMock.post(`${url}/github/git/trees`, {
      status: 200,
      body: { sha: 'treeSha' },
      headers
    })

    fetchMock.post(
      `${url}/github/git/commits?ref=newBranch`,
      {
        status: 200,
        body: { sha: 'commitSha' },
        headers
      }
    )

    fetchMock.patch(
      `${url}/github/git/refs/heads/newBranch`,
      { status: 200 }
    )

    shallowMount(actions, {
      localVue,
      store
    })

    const auth = 'Bearer 12345'
    const payload = {
      commitSha: 'commitSha',
      branch: 'newBranch',
      files: { filename: 'blobUri' },
      commitMessage: 'commitMessage'
    }

    await actions.createCommit({ state }, payload)
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(fetchMock.calls(undefined, 'POST')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(fetchMock.calls(undefined, 'POST')[1][1].headers.Authorization).toBe(
      auth
    )
    expect(fetchMock.calls(undefined, 'POST')[2][1].headers.Authorization).toBe(
      auth
    )
    expect(
      fetchMock.calls(undefined, 'PATCH')[0][1].headers.Authorization
    ).toBe(auth)
  })

  it('netlify-identityのユーザ情報の更新', async () => {
    const commit = jest.fn()
    netlifyIdentity.currentUser = jest.fn(() => ({
      token: {
        access_token: null
      }
    }))
    netlifyIdentity.refresh = jest.fn()
    const user = { token: { access_token: null } }

    await actions.updateCurrentUser({ commit })
    expect(netlifyIdentity.currentUser).toHaveBeenCalled()
    expect(netlifyIdentity.refresh).toHaveBeenCalled()
    expect(commit).toHaveBeenCalledWith('updateCurrentUser', user)
  })

  it('upload時csvを生成し、blobを取得する', async () => {
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.post(
      `${url}/github/git/blobs?ref=newBranch`,
      {
        status: 200,
        body: { sha: 'sha' }
      },
      headers
    )
    const payload = {
      commitMessage: 'commitMessage',
      files: {
        'A.jpg': 'blob1',
        'C.jpg': 'blob2',
        'B.jpg': 'blob3'
      },
      branch: 'newBranch'
    }

    expect(await getCsvBlobSha(state, payload)).toBe('sha')
    expect(fetchMock.calls(undefined, 'POST')[0][1].headers.Authorization).toBe(
      'Bearer 12345'
    )
    const postBody = JSON.parse(fetchMock.calls(undefined, 'POST')[0][1].body)
    const csv = `src,subj,tool_type,period,year,content_type,author,image_index,included_pages_num,fix_text\nscanned/A.jpg,,,,,,,,,\nscanned/B.jpg,,,,,,,,,\nscanned/C.jpg,,,,,,,,,\n`
    expect(postBody.content).toBe(csv)
  })
})
