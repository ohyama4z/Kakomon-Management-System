import { createLocalVue } from '@vue/test-utils'
import merge from 'deepmerge'
import fetchMock from 'fetch-mock'
import 'jest-fetch-mock'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import Vuex from 'vuex'
import actions, {
  convertCsvToObj,
  convertObjToCsv,
  getCsvBlobSha,
  readFileAsync
} from '../actions'

const localVue = createLocalVue()
const url = process.env.VUE_APP_URL

const defaultState = {
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
      fix_text: '',
      csvFile: 'a.csv',
      sha: '02f495e08b05c5b5b71c90a9c7c0f906a818aa80'
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
      fix_text: '',
      csvFile: 'a.csv',
      sha: '02f495e08b05c5b5b71c90a9c7c0f906a818aa80'
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
      fix_text: '',
      csvFile: 'a.csv',
      sha: '02f495e08b05c5b5b71c90a9c7c0f906a818aa80'
    }
  },

  setCommitCsv: {
    status: 'unrequested'
  },

  imageShas: {},
  imageDatas: {}
}

const getValidTokenDispatch = key =>
  key === 'getToken' ? defaultState.currentUser.token.access_token : undefined
const getInvalidTokenDispatch = key =>
  key === 'getToken' ? actions.getToken({ state: {} }) : undefined
localVue.use(Vuex)

const createGetValidTokenAndEmailDispatcher = state => key => {
  if (key === `getEmail`) {
    return state.currentUser.email
  }
  return getValidTokenDispatch(key)
}

jest.mock('node-fetch', () => jest.fn())
// netlifyIdentityの関数を使えるようにする
jest.mock('netlify-identity-widget')

describe('actions.js', () => {
  beforeEach(() => {
    fetchMock.resetBehavior()
    netlifyIdentity.open = jest.fn()
    netlifyIdentity.on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'login') {
        callback()
      }
    })

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
        csvFile: 'hoge.csv'
      },
      a: {
        src: 'a',
        name: 'b',
        birthday: 'c',
        csvFile: 'hoge.csv'
      }
    }
    expect(convertCsvToObj(csv, 'hoge.csv')).toEqual(result)
  })

  it('ブランチの一覧を取得する', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
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
    const dispatch = jest.fn(getValidTokenDispatch)
    const branches = {
      master: 'sha1',
      branch1: 'sha2'
    }

    await actions.getBranches({ commit, state, dispatch })
    expect(commit).toHaveBeenNthCalledWith(1, 'setBranchesStatus', {
      status: 'loading'
    })

    const auth = 'Bearer 12345'
    expect(commit).toHaveBeenNthCalledWith(2, 'setBranches', { branches })
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('ブランチ取得の際tokenがnullならエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    const commit = jest.fn()
    const dispatch = jest.fn(getInvalidTokenDispatch)
    await expect(
      actions.getBranches({ commit, state, dispatch })
    ).rejects.toEqual(
      new Error('state.currentUser?.token?.access_token == null')
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('コミットごとのファイルの状態を取得する(キャシュを使用しない場合)', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))

    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(`${url}/github/contents/metadatas?ref=commitSha`, {
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
    })

    const commitSha = 'commitSha'
    const dispatch = jest.fn(getValidTokenDispatch)
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
    expect(dispatch).toHaveBeenCalledTimes(3)
  })

  it('コミット取得の際tokenがnullならエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentUser = null
    const commit = jest.fn()
    const dispatch = jest.fn(getInvalidTokenDispatch)
    const commitSha = 'commitSha'
    await expect(
      actions.getCommit({ dispatch, commit, state }, commitSha)
    ).rejects.toEqual(
      new Error('state.currentUser?.token?.access_token == null')
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('コミットごとのファイルの状態を取得する(localStorageのキャッシュを使用)', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))

    const commitSha = 'commitSha'
    const dispatch = jest.fn(getValidTokenDispatch)
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
    expect(dispatch).toHaveBeenCalledTimes(2)

    expect(commit).toHaveBeenNthCalledWith(2, 'setCommit', payloadForSetCommit)
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('コミットごとのファイルの状態を取得する(stateのキャッシュを使用)', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))

    const commitSha = 'commitSha'
    const dispatch = jest.fn(getValidTokenDispatch)
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
    const state = JSON.parse(JSON.stringify(defaultState))
    state.branches = {
      status: 'loaded',
      data: { master: 'sha1' }
    }
    const dispatch = jest.fn(getValidTokenDispatch)
    const commit = jest.fn()
    const branchName = 'master'

    await actions.selectBranch({ dispatch, commit, state }, branchName)
    expect(commit).toHaveBeenCalledWith('setCurrentBranch', branchName)
    expect(dispatch).toHaveBeenCalledTimes(2)
  })

  it('ファイルごとのshaからファイル情報を取得する(キャシュを使用しない場合)', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))

    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(`${url}/github/git/blobs/fileSha`, {
      status: 200,
      body: {
        content: 'content1',
        sha: 'sha1'
      },
      headers
    })
    const csv =
      'src,subj,tool_type,period,year,content_type,author,image_index,included_pages_num,fix_text\n' +
      'studies/aho.jpg,国語,勉強用,後期定期,2007,対策プリント,おれ,001,1,'
    fetchMock.mock('text/plain;base64,content1', {
      body: { csv }
    })

    const commit = jest.fn()
    const dispatch = jest.fn(getValidTokenDispatch)
    const fileSha = 'fileSha'
    const payload = {
      sha: fileSha,
      data: {}
    }
    const auth = 'Bearer 12345'
    const filename = 'filename'

    await actions.getContentMetadata(
      { commit, state, dispatch },
      { fileSha, filename }
    )
    expect(commit).toHaveBeenNthCalledWith(1, 'setContentMetadataStatus', {
      sha: fileSha,
      status: 'loading'
    })
    expect(commit).toHaveBeenNthCalledWith(2, 'setContentMetadata', payload)
    expect(localStorage.setItem).toHaveBeenCalled()
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('ファイル情報取得の際tokenがnullならエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    const commit = jest.fn()
    const dispatch = jest.fn(getInvalidTokenDispatch)
    const fileSha = 'fileSha'
    const filename = 'filename'
    await expect(
      actions.getContentMetadata(
        { commit, dispatch, state },
        { fileSha, filename }
      )
    ).rejects.toEqual(
      new Error('state.currentUser?.token?.access_token == null')
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('ファイルごとのshaからファイル情報を取得する(localStorageのキャッシュを使用する)', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))

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
    const filename = 'filename'

    await actions.getContentMetadata({ commit, state }, { fileSha, filename })
    expect(commit).toHaveBeenNthCalledWith(1, 'setContentMetadataStatus', {
      sha: fileSha,
      status: 'loading'
    })
    expect(commit).toHaveBeenNthCalledWith(2, 'setContentMetadata', payload)
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('ファイルごとのshaからファイル情報を取得する(stateのキャッシュを使用する)', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))

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
    const filename = 'filename'

    await actions.getContentMetadata({ commit, state }, { fileSha, filename })
    expect(commit).not.toHaveBeenCalledWith('setContentMetadataStatus', {
      sha: fileSha,
      status: 'loading'
    })
    expect(localStorage.getItem).not.toHaveBeenCalled()
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('convertObjToCsvが機能するかテスト', () => {
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

  it('setCommitCsvが機能しているか', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
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
          object: {
            sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9'
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
          commit: {
            tree: {
              sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6'
            }
          }
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
          sha: '8c187d7baccab1c2abf487e09051f0ee8cb04c18'
        }
      },
      headers
    )

    // treeの作成
    fetchMock.post(`${url}/github/git/trees`, {
      status: 200,
      body: {
        sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6'
      },
      headers
    })

    // commitの作成
    fetchMock.post(
      `${url}/github/git/commits?ref=${branchName}`,
      {
        status: 200,
        body: {
          sha: '1ce0d6ec02ff4a364245a4f435cdf9a7119507a4'
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
          object: {
            sha: '1ce0d6ec02ff4a364245a4f435cdf9a7119507a4'
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
            subj: '論理回路',
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
          },
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
        }
      }
    }

    const saveContentMetadatas = merge({}, state.contentMetadatas[csvSha].data)

    const commit = jest.fn()
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state))

    await actions.postCommitCsv({ state, commit, dispatch })

    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
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
    // console.log('', fetchMock.calls(undefined, 'POST')[2][1])
    // expect(fetchMock.calls(undefined, 'POST')[2][1].headers.Authorization).toBe(
    //   postAuth
    // )

    const parsedBody = JSON.parse(fetchMock.calls(undefined, 'POST')[2][1].body)
    expect(parsedBody.author.name).toBe(userName)

    expect(
      fetchMock.calls(undefined, 'PATCH')[0][1].headers.Authorization
    ).toBe(postAuth)

    // stateが変更されていないか
    expect(state.contentMetadatas[csvSha].data).toEqual(saveContentMetadatas)

    // 編集後
    const editedCsv =
      `\ufeff` +
      `src,subj,tool_type,period,year,content_type,author,image_index,included_pages_num,fix_text` +
      `\n` +
      `tests/2018/テスト_2018_後期中間_論理回路i_問題001.jpg:,算数,勉強用,,,,,,,` +
      `\n` +
      `tests/2018/テスト_2018_後期中間_論理回路i_問題002.jpg,論理回路i,テスト,後期中間,2018,問題,,002,1,` +
      `\n` +
      `scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg,倫理社会,テスト,前期定期,2018,,,,,` +
      `\n` +
      `scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg,,,,,,,,,` +
      `\n`

    const persedConvertedBody = JSON.parse(
      fetchMock.calls(undefined, 'POST')[0][1].body
    )
    expect(persedConvertedBody.content).toBe(editedCsv)

    // commitが呼ばれたか
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loaded'
    })

    expect(commit).toHaveBeenLastCalledWith('setCommitCsvStatus', {
      status: 'loaded'
    })
  })

  it('サーバーエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentBranch = 'cmstest'
    const branchName = state.currentBranch
    const token = state.currentUser.token.access_token

    const headers = {
      Authorization: `Bearer ${token}`
    }
    const commit = jest.fn()
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state))
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
            subj: '論理回路',
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
          },
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
        }
      }
    }

    fetchMock
      .mock(`${url}/github/git/commits?ref=${branchName}`, 200, headers)
      .catch(502)
    await actions.postCommitCsv({ dispatch, state, commit })
    const badGateway = 'Bad Gateway'
    expect(dispatch).toHaveBeenCalledWith('notify', badGateway)
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
    expect(commit).toHaveBeenLastCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
  })

  it('refResのレスポンスがfalseならエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentBranch = 'cmstest'
    const branchName = state.currentBranch
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const commit = jest.fn()
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state)) // (テストで引数を全部設定する必要があるか)
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
            subj: '論理回路',
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
          },
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
        }
      }
    }

    // ref取得
    fetchMock.mock(
      `${url}/github/git/refs/heads/${branchName}`,
      // { method: 'get' },
      404,
      headers
    )
    // { method : 'get' }を加えるか
    // fethcMock.getとすると responseを見ることができない

    await actions.postCommitCsv({ state, commit, dispatch })

    const errorMessage = 'Not Found'
    expect(dispatch).toHaveBeenCalledWith('notify', errorMessage)
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
    expect(commit).toHaveBeenLastCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
  })

  it('commitResのレスポンスがfalseならエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentBranch = 'cmstest'
    const branchName = state.currentBranch
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const commit = jest.fn()
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state)) // (テストで引数を全部設定する必要があるか)
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
            subj: '論理回路',
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
          },
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
        }
      }
    }

    fetchMock.get(
      `${url}/github/git/refs/heads/${branchName}`,
      {
        status: 200,
        body: {
          object: {
            sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9'
          }
        }
      },
      headers
    )

    const commitsHash = '58c821fea857ca1e270c3b34f5bc97db64c84fc9'

    // ref取得
    fetchMock.mock(`${url}/github/commits/${commitsHash}`, 404, headers)
    await actions.postCommitCsv({ dispatch, state, commit })

    const errorMessage = 'Not Found'
    expect(dispatch).toHaveBeenCalledWith('notify', errorMessage)
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
    expect(commit).toHaveBeenLastCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
  })

  it('createBlobResのレスポンスがfalseならエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentBranch = 'cmstest'
    const branchName = state.currentBranch
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const commit = jest.fn()
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state)) // (テストで引数を全部設定する必要があるか)
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
            subj: '論理回路',
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
          },
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
        }
      }
    }

    // refの取得
    fetchMock.get(
      `${url}/github/git/refs/heads/${branchName}`,
      {
        status: 200,
        body: {
          object: {
            sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9'
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
          commit: {
            tree: {
              sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6'
            }
          }
        }
      },
      headers
    )

    // blobの作成
    fetchMock.post(`${url}/github/git/blobs?ref=${branchName}`, 404, headers)

    await actions.postCommitCsv({ dispatch, state, commit })

    const errorMessage = 'Not Found'
    expect(dispatch).toHaveBeenCalledWith('notify', errorMessage)
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
    expect(commit).toHaveBeenLastCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
  })

  it('createTreeResのレスポンスがfalseエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentBranch = 'cmstest'
    const branchName = state.currentBranch
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const commit = jest.fn()
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state)) // (テストで引数を全部設定する必要があるか)
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
            subj: '論理回路',
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
          },
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
        }
      }
    }

    // refの取得
    fetchMock.get(
      `${url}/github/git/refs/heads/${branchName}`,
      {
        status: 200,
        body: {
          object: {
            sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9'
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
          commit: {
            tree: {
              sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6'
            }
          }
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
          sha: '8c187d7baccab1c2abf487e09051f0ee8cb04c18'
        }
      },
      headers
    )

    // treeの作成
    fetchMock.post(`${url}/github/git/trees`, 404, headers)

    await actions.postCommitCsv({ dispatch, state, commit })

    const errorMessage = 'Not Found'
    expect(dispatch).toHaveBeenCalledWith('notify', errorMessage)
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
    expect(commit).toHaveBeenLastCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
  })

  it('updateRefsResのレスポンスがfalseエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentBranch = 'cmstest'
    const branchName = state.currentBranch
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const commit = jest.fn()
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state)) // (テストで引数を全部設定する必要があるか)
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
            subj: '論理回路',
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
          },
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
        }
      }
    }

    // refの取得
    fetchMock.get(
      `${url}/github/git/refs/heads/${branchName}`,
      {
        status: 200,
        body: {
          object: {
            sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9'
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
          commit: {
            tree: {
              sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6'
            }
          }
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
          sha: '8c187d7baccab1c2abf487e09051f0ee8cb04c18'
        }
      },
      headers
    )

    // treeの作成
    fetchMock.post(`${url}/github/git/trees`, {
      status: 200,
      body: {
        sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6'
      },
      headers
    })

    // commitの作成
    fetchMock.post(`${url}/github/git/commits?ref=${branchName}`, 404, headers)

    await actions.postCommitCsv({ dispatch, state, commit })

    const errorMessage = 'Not Found'
    expect(dispatch).toHaveBeenCalledWith('notify', errorMessage)
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
    expect(commit).toHaveBeenLastCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
  })

  it('Resのレスポンスがfalseエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentBranch = 'cmstest'
    const branchName = state.currentBranch
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const commit = jest.fn()
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state)) // (テストで引数を全部設定する必要があるか)
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
            subj: '論理回路',
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
          },
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
        }
      }
    }

    // refの取得
    fetchMock.get(
      `${url}/github/git/refs/heads/${branchName}`,
      {
        status: 200,
        body: {
          object: {
            sha: '58c821fea857ca1e270c3b34f5bc97db64c84fc9'
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
          commit: {
            tree: {
              sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6'
            }
          }
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
          sha: '8c187d7baccab1c2abf487e09051f0ee8cb04c18'
        }
      },
      headers
    )

    // treeの作成
    fetchMock.post(`${url}/github/git/trees`, {
      status: 200,
      body: {
        sha: '2192c7b798b4d4479e942f4d065780b44a04dbd6'
      },
      headers
    })

    // commitの作成
    fetchMock.post(
      `${url}/github/git/commits?ref=${branchName}`,
      {
        status: 200,
        body: {
          sha: '1ce0d6ec02ff4a364245a4f435cdf9a7119507a4'
        }
      },
      headers
    )

    // refの更新
    fetchMock.patch(`${url}/github/git/refs/heads/${branchName}`, 404, headers)

    await actions.postCommitCsv({ dispatch, state, commit })

    const errorMessage = 'Not Found'
    expect(dispatch).toHaveBeenCalledWith('notify', errorMessage)
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'loading'
    })
    expect(commit).toHaveBeenLastCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
    expect(commit).toHaveBeenCalledWith('setCommitCsvStatus', {
      status: 'failed'
    })
    expect(dispatch).toHaveBeenCalledTimes(3)
  })

  it('ファイル編集の際tokenがnullならエラー', async () => {
    const dispatch = jest.fn(getInvalidTokenDispatch)
    const commit = jest.fn()
    await expect(actions.postCommitCsv({ dispatch, commit })).rejects.toEqual(
      new Error('state.currentUser?.token?.access_token == null')
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('画像ファイルのshaを取得する(キャッシュなし)', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(`${url}/github/contents/dir?ref=sha`, {
      status: 200,
      body: [
        { name: 'file1.jpg', sha: 'imageSha1', download_url: 'url1' },
        { name: 'file2.jpg', sha: 'imageSha2', download_url: 'url2' }
      ],
      headers
    })

    const dispatch = jest.fn(getValidTokenDispatch)
    const commit = jest.fn()
    const directoryPath = 'dir'
    const commitSha = 'sha'

    const payload = {
      directoryPath,
      commitSha,
      data: {
        'file1.jpg': { sha: 'imageSha1', url: 'url1' },
        'file2.jpg': { sha: 'imageSha2', url: 'url2' }
      }
    }
    const auth = 'Bearer 12345'

    await actions.getImageShas(
      { state, commit, dispatch },
      { directoryPath, commitSha }
    )
    expect(commit).toHaveBeenCalledWith('setImageShas', payload)
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('画像ファイルのshaの取得の際tokenがnullならエラー', async () => {
    const dispatch = jest.fn(getInvalidTokenDispatch)
    const commit = jest.fn()
    const directoryPath = 'dir'
    const commitSha = 'sha'

    await expect(
      actions.getImageShas(
        { dispatch, commit, state: {} },
        { directoryPath, commitSha }
      )
    ).rejects.toEqual(
      new Error('state.currentUser?.token?.access_token == null')
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('画像ファイルのshaを取得する(stateキャッシュあり)', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    const commit = jest.fn()
    const directoryPath = 'dir'
    const commitSha = 'sha'
    state.imageShas = {
      sha: {
        dir: { status: 'loaded' }
      }
    }

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
    const state = JSON.parse(JSON.stringify(defaultState))

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
            file1: { sha: 'sha1' },
            file2: { sha: 'sha2' }
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

    const commit = jest.fn()
    const dispatch = jest.fn(getValidTokenDispatch)
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
    expect(dispatch).toHaveBeenCalledTimes(3)
  })

  it('画像データを取得の取得の際tokenがnullならエラー', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))
    state.currentUser = null
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
    const commit = jest.fn()
    const dispatch = jest.fn(getInvalidTokenDispatch)

    await expect(
      actions.getImageDatas({ dispatch, state, commit }, 'fileSha')
    ).rejects.toEqual(
      new Error('state.currentUser?.token?.access_token == null')
    )
    expect(dispatch).toHaveBeenCalledTimes(3)
  })

  it('ブランチの新規作成', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))

    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(`${url}/github/git/refs/heads/master`, {
      status: 200,
      body: {
        object: {
          sha: 'sha'
        }
      },
      headers
    })

    fetchMock.post(`${url}/github/git/refs`, {
      status: 201
    })

    const dispatch = jest.fn(getValidTokenDispatch)
    const commit = jest.fn()
    const branch = 'newBranch'
    const auth = 'Bearer 12345'
    const body = JSON.stringify({ ref: `refs/heads/newBranch`, sha: `sha` })

    await actions.createBranch({ state, dispatch, commit }, branch)
    expect(commit).toHaveBeenCalledWith('setBranchesStatus', {
      status: 'loading'
    })
    expect(fetchMock.calls(undefined, 'GET')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(fetchMock.calls(undefined, 'POST')[0][1].headers.Authorization).toBe(
      auth
    )
    expect(fetchMock.calls(undefined, 'POST')[0][1].body).toEqual(body)
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('ブランチの新規作成の際tokenがnullならエラー', async () => {
    const commit = jest.fn()
    const branch = 'newBranch'
    const dispatch = jest.fn(getInvalidTokenDispatch)
    await expect(
      actions.createBranch({ dispatch, commit }, branch)
    ).rejects.toEqual(
      new Error('state.currentUser?.token?.access_token == null')
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('新しいファイルのアップロード', async () => {
    const state = JSON.parse(JSON.stringify(defaultState))

    state.branches = {
      data: {
        newBranch: 'commitSha'
      }
    }

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
    const state = JSON.parse(JSON.stringify(defaultState))

    const token = state.currentUser.token.access_token
    const headers = {
      Authorization: `Bearer ${token}`
    }

    fetchMock.get(`${url}/github/git/commits/commitSha`, {
      status: 200,
      body: {
        tree: {
          sha: 'baseTreeSha'
        }
      },
      headers
    })

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

    fetchMock.post(`${url}/github/git/blobs?ref=newBranch`, {
      status: 201,
      body: { sha: 'blobSha' },
      headers
    })

    fetchMock.post(`${url}/github/git/trees`, {
      status: 200,
      body: { sha: 'treeSha' },
      headers
    })

    fetchMock.post(`${url}/github/git/commits?ref=newBranch`, {
      status: 200,
      body: { sha: 'commitSha' },
      headers
    })

    fetchMock.patch(`${url}/github/git/refs/heads/newBranch`, { status: 200 })

    const auth = 'Bearer 12345'
    const dispatch = jest.fn(createGetValidTokenAndEmailDispatcher(state))
    const payload = {
      commitSha: 'commitSha',
      branch: 'newBranch',
      files: { filename: 'blobUri' },
      commitMessage: 'commitMessage'
    }

    await actions.createCommit({ state, dispatch }, payload)
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
    expect(dispatch).toHaveBeenCalledTimes(2)
  })

  it('commitの作成の際tokenがnullならエラー', async () => {
    const dispatch = jest.fn(getInvalidTokenDispatch)
    const payload = {
      commitSha: 'commitSha',
      branch: 'newBranch',
      files: { filename: 'blobUri' },
      commitMessage: 'commitMessage'
    }
    await expect(actions.createCommit({ dispatch }, payload)).rejects.toEqual(
      new Error('state.currentUser?.token?.access_token == null')
    )
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('blobからbase64の取得の際string以外が帰ってきたらエラー', async () => {
    global.FileReader = function () {
      this.readAsDataURL = () => {
        this.result = 12345
        this.onload()
      }
    }
    const blob = new Blob(['hello'], { type: 'text/plain' })

    await expect(readFileAsync(blob)).rejects.toEqual(
      new Error("typeof reader.result !== 'string'")
    )
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
    const state = JSON.parse(JSON.stringify(defaultState))

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

    expect(await getCsvBlobSha(token, payload)).toBe('sha')
    expect(fetchMock.calls(undefined, 'POST')[0][1].headers.Authorization).toBe(
      'Bearer 12345'
    )
    const postBody = JSON.parse(fetchMock.calls(undefined, 'POST')[0][1].body)
    const csv = `src,subj,tool_type,period,year,content_type,author,image_index,included_pages_num,fix_text\nscanned/A.jpg,,,,,,,,,\nscanned/B.jpg,,,,,,,,,\nscanned/C.jpg,,,,,,,,,\n`
    expect(postBody.content).toBe(csv)
  })

  it('通知内容をstateに追加するmutationを呼ぶ', () => {
    const message = 'あほ'
    const commit = jest.fn()
    actions.notify({ commit }, message)
    expect(commit).toHaveBeenCalledWith('notify', { message: 'あほ' })
  })

  it('Vue側からの通知の内容変更をstateと同期させるmutationを呼ぶ', () => {
    const messages = ['aho', 'oha']
    const commit = jest.fn()
    actions.syncNotificationsChange({ commit }, messages)
    expect(commit).toHaveBeenCalledWith('syncNotificationsChange', {
      messages: ['aho', 'oha']
    })
  })
})
