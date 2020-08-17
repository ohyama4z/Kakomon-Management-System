import PromisePool from 'native-promise-pool'
import netlifyIdentity from 'netlify-identity-widget'

export default {
  upload: async ({ commit }, newFile) => {
    commit('upload', newFile)
  },

  getMetadatas: async ({ commit, state }) => {
    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const httpRes = await fetch(
      'http://localhost:8085/.netlify/git/github/branches',
      { method, headers }
    )
    const res = await httpRes.json()

    commit('getBranches', res)
  },

  getBranchData: async ({ commit, state }, branchName) => {
    // commit('setStatusLoading', state.setCsvObj)
    commit('setStatus', 'csvObj', 'loading')

    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    console.log(branchName)
    const httpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${branchName}`,
      { method, headers }
    )
    // const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas/unassorted.csv?ref=${branchName}`, {method, headers})
    const resArr = await httpRes.json()
    console.log('^_^', resArr)

    const pool = new PromisePool(50) // 50 tasks at once

    const files = await Promise.all(
      resArr.map(res =>
        pool.open(async () => {
          const previousRes =
            state.setCsvObj.unparsedData[`${branchName}`]?.[`${res.name}`]
          // state.setCsvObj.unparsedData[`${branchName}`]?.[`${res.name}`]の
          // ?. の部分がわからないときはOptional Chaningでググれ

          if (previousRes == null || res.sha !== previousRes.sha) {
            const unparsed = localStorage.getItem(`${res.sha}`)
            const branchDataInStorage = JSON.parse(unparsed)
            if (branchDataInStorage == null) {
              const httpResponse = await fetch(
                `http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${branchName}`,
                { method, headers }
              )
              const response = await httpResponse.json()
              commit('branchDataOnGithub', {
                branchData: response,
                branchName,
                fileName: res.name
              })
              localStorage.setItem(`${res.sha}`, JSON.stringify(response))
            } else if (res.sha === branchDataInStorage.sha) {
              console.log('using localStorage cache')
              commit('branchDataOnGithub', {
                branchData: branchDataInStorage,
                branchName,
                fileName: res.name
              })
            }
          } else {
            console.log('using state cache')
          }

          const curRes =
            state.setCsvObj.unparsedData[`${branchName}`][`${res.name}`]
          const csvData = Buffer.from(curRes.content, 'base64').toString('utf8')
          // console.log(csvData)
          const resultObj = convertCsvToObjArray(csvData)
          // console.log(resultObj)

          return resultObj
        })
      )
    )

    const filesBySrc = files.reduce((p, v) => {
      return {
        ...p,
        ...v
      }
    }, {})

    // console.log(':( (2)', JSON.stringify({ files }, null, 2))

    commit('setCsvObj', filesBySrc)
  },

  updateCurrentUser: async ({ commit }) => {
    const user = netlifyIdentity.currentUser()
    if (user != null && user.token.access_token == null) {
      await netlifyIdentity.refresh()
    }
    commit('updateCurrentUser', user)
  }
}

export const convertCsvToObjArray = csv => {
  // header:CSV1行目の項目 :csvRows:項目に対する値
  const [headerNames, ...csvRows] = csv
    .split('\n')
    .filter(row => row !== '')
    .map(row => {
      return row.split(',')
    })

  return csvRows
    .map(r => {
      return headerNames
        .map((headerName, index) => {
          // ヘッダーの空白文字を削除。keyとvalueに値をセット
          return { key: headerName.replace(/\s+/g, ''), value: r[index] }
        })
        .reduce((previous, current) => {
          // {key: "物", value: "MacBook", メーカー: "apple", 値段: "3000"}を作成
          previous[current.key] = current.value
          return previous
        }, {})
    })
    .reduce((previous, current) => {
      previous[current.src] = current
      return previous
    }, {})
}
