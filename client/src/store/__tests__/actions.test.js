import { createLocalVue, shallowMount } from '@vue/test-utils'
import fetchMock from 'fetch-mock'
import 'jest-fetch-mock'
import 'jest-localstorage-mock'
import netlifyIdentity from 'netlify-identity-widget'
import Vuex from 'vuex'
import actions, { convertCsvToObjArray } from '../actions'
import mutations from '../mutations'

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
      accens_token: 'aaa'
    }
  },
  setCsvObj: {
    unparsedData: {
      master: {
        aho: { content: '44Ki44Ob44OQ44Kr44Oe44OM44Kx' },
        afo: { content: 'aWRpb3QhIV93dGZfcl91X2RvaW4=' }
      }
    },
    status: 'unrequested'
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
    expect(convertCsvToObjArray(csv)).toEqual(result)
  })

  it('branchの各データの取得の際stateのキャッシュがあれば使用する', async () => {
    state.setCsvObj.unparsedData.master.aho = {
      content: '44Ki44Ob44OQ44Kr44Oe44OM44Kx'
    }
    state.setCsvObj.unparsedData.master.afo = {
      content: 'aWRpb3QhIV93dGZfcl91X2RvaW4='
    }

    localStorage['111'] = JSON.stringify({
      sha: '111',
      str: 'AHO_BAKA_MANUKE',
      content: '44Ki44Ob44OQ44Kr44Oe44OM44Kx'
    })

    localStorage['222'] = JSON.stringify({
      sha: '222',
      str: '阿呆_馬鹿_間抜',
      content: 'aWRpb3QhIV93dGZfcl91X2RvaW4='
    })

    fetchMock.get(
      `http://localhost:8085/.netlify/git/github/contents/metadatas?ref=master`,
      {
        status: 200,
        body: [
          { sha: '111', name: 'aho' },
          { sha: '222', name: 'afo' }
        ]
      }
    )
    fetchMock.get(
      `http://localhost:8085/.netlify/git/github/git/blobs/111?ref=master`,
      {
        status: 200,
        body: {
          str: 'AHO_BAKA_MANUKE',
          content: '44Ki44Ob44OQ44Kr44Oe44OM44Kx'
        }
      }
    )

    fetchMock.get(
      `http://localhost:8085/.netlify/git/github/git/blobs/222?ref=master`,
      {
        status: 200,
        body: {
          str: '阿呆_馬鹿_間抜',
          content: 'aWRpb3QhIV93dGZfcl91X2RvaW4='
        }
      }
    )

    const commit = jest.fn()
    const branchName = 'master'
    shallowMount(actions, {
      localVue,
      store
    })

    // localStorage及びstateにデータがある場合キャッシュを使用する
    await actions.getCommit({ state, commit }, branchName)
    expect(commit).toHaveBeenNthCalledWith(1, 'setStatus', {
      path: 'csvObj',
      status: 'loading'
    })
    expect(commit).toHaveBeenCalledTimes(4) // setStatus + setCsvObjで計2
    expect(localStorage.setItem).not.toHaveBeenCalled()

    fetchMock.restore()
  })

  it('stateのキャッシュが無く,localStorageにキャッシュがある場合はlocalStorageのキャッシュを使用しstateにデータを追加する', async () => {
    state.setCsvObj.unparsedData.master.aho = null
    state.setCsvObj.unparsedData.master.afo = null

    localStorage['111'] = JSON.stringify({
      sha: '111',
      str: 'AHO_BAKA_MANUKE',
      content: '44Ki44Ob44OQ44Kr44Oe44OM44Kx'
    })

    localStorage['222'] = JSON.stringify({
      sha: '222',
      str: '阿呆_馬鹿_間抜',
      content: 'aWRpb3QhIV93dGZfcl91X2RvaW4='
    })

    fetchMock.get(
      `http://localhost:8085/.netlify/git/github/contents/metadatas?ref=master`,
      {
        status: 200,
        body: [
          { sha: '111', name: 'aho' },
          { sha: '222', name: 'afo' }
        ]
      }
    )
    fetchMock.get(
      `http://localhost:8085/.netlify/git/github/git/blobs/111?ref=master`,
      {
        status: 200,
        body: {
          str: 'AHO_BAKA_MANUKE',
          content: '44Ki44Ob44OQ44Kr44Oe44OM44Kx'
        }
      }
    )

    fetchMock.get(
      `http://localhost:8085/.netlify/git/github/git/blobs/222?ref=master`,
      {
        status: 200,
        body: {
          str: '阿呆_馬鹿_間抜',
          content: 'aWRpb3QhIV93dGZfcl91X2RvaW4='
        }
      }
    )

    console.log(localStorage)

    const commit = jest.fn((funcName, payload) => {
      if (funcName === 'saveBase64EncodedCsv') {
        mutations.saveBase64EncodedCsv(state, payload)
      }
    })
    const branchName = 'master'
    shallowMount(actions, {
      localVue,
      store
    })

    // localStorageのキャッシュを使用し
    await actions.getCommit({ state, commit }, branchName)
    expect(commit).toHaveBeenNthCalledWith(1, 'setStatus', {
      path: 'csvObj',
      status: 'loading'
    })
    expect(commit).toHaveBeenCalledTimes(4) // setStatus + saveBase64EncodedCsv*2 + setCsvObjで計4
    expect(localStorage.setItem).not.toHaveBeenCalled()
    expect(commit).toHaveBeenNthCalledWith(4, 'setCsvObj', {})

    fetchMock.restore()
  })
})
