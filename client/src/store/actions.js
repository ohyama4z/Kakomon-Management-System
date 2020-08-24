import netlifyIdentity from 'netlify-identity-widget'
import state from './state'

const moment = require('moment')

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
      await Promise.all([
        Object.entries(commitDataInLocalStorage).map(async ([, sha]) => {
          await dispatch('getContentMetadata', sha)
        })
      ])

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

  setCommitCSV: async ({ state, commit }, branchName) => {
    // console.log('asdfasdfasdfasdf', branchName)
    // console.log(sendObj)
    const token = state.currentUser.token.access_token
    const getmethod = 'GET'
    const postmethod = 'POST'
    const patchmethod = 'PATCH'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const userEmail = state.currentUser.email
    const userNameLength = userEmail.search('@')
    // console.log(found);
    // console.log(userEmail.slice(0, userNameLength));
    const userName = userEmail.slice(0, userNameLength)
    console.log('username', userName)

    const editcsvobj = state.changedFiles
    // console.log(state)
    // console.log(editcsvobj)

    // editedobject→csv
    // console.log(Object.values(editcsvobj))
    const objarray = Object.values(editcsvobj)
    const content = convertToCSV(objarray)
    // console.log('content', content)

    // //   console.log('refarr', resArr[0].sha) //filehash

    // refの取得
    const branchref = await fetch(
      `http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`,
      { getmethod, headers }
    )
    const parseref = await branchref.json()
    // console.log(parseref)
    // console.log(parseref.object)
    // console.log('branch毎のハッシュ', `${branchName}`, parseref.object.sha)

    // commitの取得
    const commithttpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/commits/${parseref.object.sha}`,
      { getmethod, headers }
    )
    const commitres = await commithttpRes.json()
    // console.log(':p~', commitres)
    // console.log(':p~', commitres, sendObj)

    const postcontents = {
      // content: 'dGVzdCBjb21taXQ=',
      // encoding: 'base64'
      content,
      encoding: 'utf-8'
    }
    const bodys = JSON.stringify(postcontents)

    // blobの作成
    const refhttpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/git/blobs?ref=${branchName}`,
      { method: postmethod, headers, body: bodys }
    ) // { headerss: {'Content-Type': 'application/json'}}
    const refres = await refhttpRes.json()
    // console.log(':q~', refres)

    // // const masmaster = await fetch('http://localhost:8085/.netlify/git/github/branches/master', {method: getmethod, headers})
    // // const masres = await masmaster.json()

    // console.log(commitres.sha, masres.commit.sha) 同じ値
    const treesbody = {
      // base_tree: commitres.sha,
      base_tree: commitres.commit.tree.sha,
      tree: [
        {
          path: 'test.csv',
          mode: '100644', // 100644  100755 , 040000 160000  シンボリックリンクのパス120000
          type: 'blob',
          sha: refres.sha
        }
      ]
    }

    // treeの作成
    const treesbodys = JSON.stringify(treesbody)
    const branchhttpRes = await fetch(
      'http://localhost:8085/.netlify/git/github/git/trees',
      { method: postmethod, headers, body: treesbodys }
    )
    const branchres = await branchhttpRes.json()
    // console.log('branchesres', branchres)
    // console.log('check', refres.sha, branchres.sha, parseref.object.sha)
    const date = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    // console.log('time', date)

    const commitsbody = {
      message: date,
      author: {
        name: userName,
        email: userEmail,
        date
      },
      parents: [
        // refres.sha
        parseref.object.sha
      ],
      tree: branchres.sha
    }
    const commitsbodys = JSON.stringify(commitsbody)
    // console.log(commitsbodys)

    // commitの作成
    const createcommithttpres = await fetch(
      `http://localhost:8085/.netlify/git/github/git/commits?ref=${branchName}`,
      { method: postmethod, headers, body: commitsbodys }
    )
    const createcommitres = await createcommithttpres.json()
    // console.log('commithash', createcommitres.sha)

    // refの更新
    const updatebody = {
      sha: createcommitres.sha,
      force: false // 強制pushするか否
    }
    const updatebodys = JSON.stringify(updatebody)
    const updaterefhttpres = await fetch(
      `http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`,
      { method: patchmethod, headers, body: updatebodys }
    )
    // console.log(updatebodys)
    const updaterefres = await updaterefhttpres.json()
    console.log('asdf', updaterefres)
    // console.log(':(', csvObj)
    // commit('setCsvObj', csvObj)
    commit('setCommitCSV')
  },

  updateCurrentUser: async ({ commit }) => {
    const user = netlifyIdentity.currentUser()
    if (user != null && user.token.access_token == null) {
      await netlifyIdentity.refresh()
    }
    commit('updateCurrentUser', user)
  },

  getImageShas: async ({ state, commit }, { commitSha, directoryPath }) => {
    if (state.imageShas?.[commitSha]?.[directoryPath]?.status === 'loaded') {
      return
    }

    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const httpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/contents/${directoryPath}?ref=${commitSha}`,
      { method, headers }
    )
    const res = await httpRes.json()

    const data = Object.fromEntries(res.map(file => [file.name, file.sha]))
    commit('setImageShas', { commitSha, directoryPath, data })
  },

  getImageDatas: async ({ dispatch, state, commit }, fileSha) => {
    const commitSha = state.branches.data[state.currentBranch]
    const files = state.contentMetadatas[fileSha].data
    const directoryPath = Object.keys(files)[0].substr(
      0,
      Object.keys(files)[0].lastIndexOf('/')
    )

    const filePaths = Object.keys(files)
    commit('setDisplayedFiles', filePaths)
    await dispatch('getImageShas', { commitSha, directoryPath })

    console.log(state.imageShas[commitSha][directoryPath].data)

    const filenames = Object.values(files).map(file => {
      const path = file.src
      return path.substr(path.lastIndexOf('/') + 1)
    })

    await Promise.all(
      filenames.map(async filename => {
        const sha = state.imageShas[commitSha][directoryPath].data[filename]
        const token = state.currentUser.token.access_token
        const method = 'GET'
        const headers = {
          Authorization: `Bearer ${token}`
        }
        const httpRes = await fetch(
          `http://localhost:8085/.netlify/git/github/git/blobs/${sha}`,
          { method, headers }
        )
        const res = await httpRes.json()

        // Todo: image/ だけじゃなくpdfとかもあるので対応できるようにする
        const imageType = filename.substr(filename.lastIndexOf('.') + 1)
        const blob = toBlob(res.content, imageType)
        const blobUri = URL.createObjectURL(blob)

        commit('setImageData', { sha, blobUri })
      })
    )
  }
}

export function convertToCSV(arr) {
  const array = [Object.keys(arr[0])].concat(arr)
  return array
    .map(it => {
      return Object.values(it).toString()
    })
    .join('\n')
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
      previous[current.src] = {
        ...current,
        sha: { status: 'unrequested', data: {} }
      }
      return previous
    }, {})
}

function toBlob(base64, type) {
  const bin = atob(base64.replace(/^.*,/, ''))
  const buffer = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i)
  }
  // Blobを作成

  return new Blob([buffer.buffer], { type })
}
