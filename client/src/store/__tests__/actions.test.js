import { createLocalVue, shallowMount } from '@vue/test-utils'
import fetchMock from 'fetch-mock'
import 'jest-fetch-mock'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import Vuex from 'vuex'
import actions, { convertCsvToObj, convertToCSV } from '../actions'

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
    }
  },

  setCommitCSV: {
    status: 'unrequested'
  }
}

const store = new Vuex.Store({
  state,
  actions
})

describe('action.js', () => {
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
        birthday: '0616'
      },
      a: {
        src: 'a',
        name: 'b',
        birthday: 'c'
      }
    }
    expect(convertCsvToObj(csv)).toEqual(result)
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
    console.log('localstorageclearcheck', localStorage)
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
    console.log(convertToCSV(objarr), result)
    expect(convertToCSV(objarr)).toEqual(result)
  })

  it('setCommitCSV', async () => {
    // const state
    const commit = jest.fn()
    const branchName = 'cmstest'

    // ref取得
    fetchMock.get(
      `http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`,
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
      }
    )

    const commitsHash = '58c821fea857ca1e270c3b34f5bc97db64c84fc9'

    // commitの取得
    fetchMock.get(
      `http://localhost:8085/.netlify/git/github/commits/${commitsHash}`,
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
      }
    )

    // blobの作成
    fetchMock.post(
      `http://localhost:8085/.netlify/git/github/git/blobs?ref=${branchName}`,
      {
        status: 200,
        body: {
          sha: '8c187d7baccab1c2abf487e09051f0ee8cb04c18',
          url:
            'https://api.github.com/repos/satackey/test-preps/git/blobs/8c187d7baccab1c2abf487e09051f0ee8cb04c18'
        }
      }
    )

    // treeの作成
    fetchMock.post('http://localhost:8085/.netlify/git/github/git/trees', {
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
      }
    })

    // commitの作成
    fetchMock.post(
      `http://localhost:8085/.netlify/git/github/git/commits?ref=${branchName}`,
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
      }
    )

    // refの更新
    fetchMock.patch(
      `http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`,
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
      }
    )

    await actions.setCommitCSV({ state, commit }, branchName)
    expect(commit).toHaveBeenNthCalledWith(1, 'setCommitCSV')
  })
})
