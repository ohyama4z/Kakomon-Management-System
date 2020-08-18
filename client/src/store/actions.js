import netlifyIdentity from 'netlify-identity-widget'
import state from './state'

export default {
  upload: async ({ commit }, newFile) => {
    commit('upload', newFile)
  },

  getBranches: async ({ commit, state }) => {
    commit('setBrachesStatus', { path: 'branches', status: 'loading' })
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
    console.log({ getBranches: res })

    const branches = Object.fromEntries(
      res.map(branch => [branch.name, branch.sha])
    )
    commit('setBranches', { branches })
  },

  selectBranch: async ({ dispatch, commit }, branchName) => {
    await dispatch('getBranches')
    const commitSha = state.branches.data[branchName]
    console.log({ commitSha })
    await dispatch('getCommit', commitSha)
  },

  getCommit: async ({ dispatch, commit, state }, commitSha) => {
    commit('setCommitStatus', { sha: commitSha, status: 'loading' })
    // const branchName = Object.entries(state.branches.data).reduce(
    //   (pre, [key, sha]) => {
    //     pre = sha === branchSha ? key : pre
    //     return pre
    //   },
    //   null
    // )
    // commit('setCurrentBranch', branchName)
    const commitDataInLocalStorage = JSON.parse(localStorage.getItem(commitSha))
    if (commitDataInLocalStorage != null) {
      commit('setCommit', {
        sha: commitSha,
        data: commitDataInLocalStorage
      })

      Object.entries(commitDataInLocalStorage).map(async ([, sha]) => {
        await dispatch('getContentMetadata', sha)
      })

      return
    }

    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const httpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${commitSha}`,
      { method, headers }
    )
    const res = await httpRes.json()

    // const commitData = res.reduce((pre, file) => {
    //   pre[file.name] = file.sha
    //   return pre
    // }, {})

    const commitData = Object.fromEntries(
      res.map(file => [file.name, file.sha])
    )

    Object.entries(commitData).map(async ([, sha]) => {
      await dispatch('getContentMetadata', sha)
    })

    commit('setCommit', {
      sha: commitSha,
      data: commitData
    })

    localStorage.setItem(`${commitSha}`, JSON.stringify(commitData))
    // commit('setCommitsStatus', { branchSha, status: 'loaded' })
  },

  getContentMetadata: async ({ commit, state }, fileSha) => {
    commit('setContentMetadataStatus', { sha: fileSha, status: 'loading' })

    const fileDataInLocalStorage = JSON.parse(localStorage.getItem(fileSha))
    if (fileDataInLocalStorage != null) {
      commit('setContentMetadata', {
        sha: fileSha,
        data: fileDataInLocalStorage
      })
      commit('setContentMetadataStatus', { sha: fileSha, status: 'loaded' })
      return
    }

    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const httpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/git/blobs/${fileSha}`,
      { method, headers }
    )
    const res = await httpRes.json()

    const csvData = Buffer.from(res.content, 'base64').toString('utf8')
    const resultObj = convertCsvToObjArray(csvData)

    commit('setContentMetadata', {
      sha: fileSha,
      data: resultObj
    })

    localStorage.setItem(fileSha, JSON.stringify(resultObj))
    commit('setContentMetadataStatus', { sha: fileSha, status: 'loaded' })
  },

  updateCurrentUser: async ({ commit }) => {
    const user = netlifyIdentity.currentUser()
    if (user != null && user.token.access_token == null) {
      await netlifyIdentity.refresh()
    }
    commit('updateCurrentUser', user)
  }

  //   getCommitOld: async ({ commit, state }, branchName) => {
  //     // commit('setStatusLoading', state.setCsvObj)
  //     commit('setStatus', { path: 'setCsvObj', status: 'loading' })
  //     commit('setCurrentBranch', branchName)

  //     const token = state.currentUser.token.access_token
  //     const method = 'GET'
  //     const headers = {
  //       Authorization: `Bearer ${token}`
  //     }
  //     console.log(branchName)
  //     const httpRes = await fetch(
  //       `http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${state.currentBranch}`,
  //       { method, headers }
  //     )
  //     // const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas/unassorted.csv?ref=${branchName}`, {method, headers})
  //     const resArr = await httpRes.json()
  //     console.log('aho', resArr)

  //     commit('setCommits')

  //     const pool = new PromisePool(50) // 50 tasks at once

  //     const files = await Promise.all(
  //       resArr.map(res =>
  //         pool.open(async () => {
  //           const previousRes =
  //             state.setCsvObj.unparsedData[`${state.currentBranch}`]?.[
  //               `${res.name}`
  //             ]
  //           // state.csvBySha[fileSha] = csv
  //           // state.commits[commitSha] = [filesha1, filesha2]
  //           // state.currentBranch = 'master'
  //           // state.branches[branch] = commitSha
  //           // state.setCsvObj.unparsedData[`${state.currentBranch}`]?.[`${res.name}`]の
  //           // ?. の部分がわからないときはOptional Chaningでググれ

  //           if (previousRes == null || res.sha !== previousRes.sha) {
  //             const unparsed = localStorage.getItem(`${res.sha}`)
  //             const branchDataInStorage = JSON.parse(unparsed)

  //             if (branchDataInStorage == null) {
  //               const httpResponse = await fetch(
  //                 `http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${state.currentBranch}`,
  //                 { method, headers }
  //               )
  //               const response = await httpResponse.json()
  //               commit('saveBase64EncodedCsv', {
  //                 branchData: response,
  //                 branchName: state.currentBranch,
  //                 fileName: res.name
  //               })
  //               localStorage.setItem(`${res.sha}`, JSON.stringify(response))
  //             } else if (res.sha === branchDataInStorage.sha) {
  //               console.log('using localStorage cache')
  //               commit('saveBase64EncodedCsv', {
  //                 branchData: branchDataInStorage,
  //                 branchName: state.currentBranch,
  //                 fileName: res.name
  //               })
  //             }
  //           } else {
  //             console.log('using state cache')
  //           }

  //           const curRes =
  //             state.setCsvObj.unparsedData[`${state.currentBranch}`][
  //               `${res.name}`
  //             ]
  //           const csvData = Buffer.from(curRes.content, 'base64').toString('utf8')
  //           // console.log(csvData)
  //           const resultObj = convertCsvToObjArray(csvData)
  //           // console.log(resultObj)

  //           return resultObj
  //         })
  //       )
  //     )

  //     const filesBySrc = files.reduce((p, v) => {
  //       return {
  //         ...p,
  //         ...v
  //       }
  //     }, {})

  //     // console.log(':( (2)', JSON.stringify({ files }, null, 2))

  //     commit('setCsvObj', filesBySrc)
  //   }
}

export function convertCsvToObjArray(csv) {
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
