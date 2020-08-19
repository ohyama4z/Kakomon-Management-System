import netlifyIdentity from 'netlify-identity-widget'
import state from './state'

export default {
  upload: async ({ commit }, newFile) => {
    commit('upload', newFile)
  },

  getBranches: async ({ commit, state }) => {
    commit('setBranchesStatus', { path: 'branches', status: 'loading' })
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

    const branches = Object.fromEntries(
      res.map(branch => [branch.name, branch.commit.sha])
    )
    commit('setBranches', { branches })
  },

  selectBranch: async ({ dispatch, commit }, branchName) => {
    commit('setCurrentBranch', branchName)
    await dispatch('getBranches')
    const commitSha = state.branches.data[branchName]
    await dispatch('getCommit', commitSha)
  },

  getCommit: async ({ dispatch, commit, state }, commitSha) => {
    const commitDataInState = state.commits?.[commitSha]
    if (commitDataInState?.status === 'loaded') {
      Object.entries(commitDataInState.data).map(async ([, sha]) => {
        await dispatch('getContentMetadata', sha)
      })

      return
    }

    commit('setCommitStatus', { sha: commitSha, status: 'loading' })

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
  },

  getContentMetadata: async ({ commit, state }, fileSha) => {
    const fileDataInState = state.contentMetadatas?.[fileSha]
    if (fileDataInState?.status === 'loaded') {
      return
    }

    commit('setContentMetadataStatus', { sha: fileSha, status: 'loading' })

    const fileDataInLocalStorage = JSON.parse(localStorage.getItem(fileSha))
    if (fileDataInLocalStorage != null) {
      console.log('getContentMetadata by localStorage cache')
      commit('setContentMetadata', {
        sha: fileSha,
        data: fileDataInLocalStorage
      })
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
    const resultObj = convertCsvToObj(csvData)

    commit('setContentMetadata', {
      sha: fileSha,
      data: resultObj
    })

    localStorage.setItem(fileSha, JSON.stringify(resultObj))
  },

  updateCurrentUser: async ({ commit }) => {
    const user = netlifyIdentity.currentUser()
    if (user != null && user.token.access_token == null) {
      await netlifyIdentity.refresh()
    }
    commit('updateCurrentUser', user)
  }
}

export function convertCsvToObj(csv) {
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
