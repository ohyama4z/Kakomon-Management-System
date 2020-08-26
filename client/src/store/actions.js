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
    const getMethod = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const httpRes = await fetch(
      'http://localhost:8085/.netlify/git/github/branches',
      { method: getMethod, headers }
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
    const getMethod = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const httpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${commitSha}`,
      { method: getMethod, headers }
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
    const getMethod = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const httpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/git/blobs/${fileSha}`,
      { method: getMethod, headers }
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

  postCommitCsv: async ({ state }, branchName) => {
    console.log('asdfasdfasdfasdf', branchName)
    const token = state.currentUser.token.access_token
    const getMethod = 'GET'
    const postMethod = 'POST'
    const patchMethod = 'PATCH'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const userEmail = state.currentUser.email
    const userNameLength = userEmail.search('@')
    const userName = userEmail.slice(0, userNameLength)
    console.log('username', userName)

    const editCsvObj = state.changedFiles
    console.log(state)
    console.log(editCsvObj)

    // editedobject→csv
    console.log(Object.values(editCsvObj))
    const objArray = Object.values(editCsvObj)
    const content = convertObjToCsv(objArray)
    console.log('content', content)

    // //   console.log('refarr', resArr[0].sha) //filehash

    // refの取得
    const refRes = await fetch(
      `http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`,
      { method: getMethod, headers }
    )
    const parseRef = await refRes.json()
    console.log(parseRef)
    console.log('branch毎のハッシュ', `${branchName}`, parseRef.object.sha)

    // commitの取得
    const commitRes = await fetch(
      `http://localhost:8085/.netlify/git/github/commits/${parseRef.object.sha}`,
      { method: getMethod, headers }
    )
    const commitres = await commitRes.json()
    console.log(':p~', commitres)

    const postContents = {
      // content: 'dGVzdCBjb21taXQ=',
      // encoding: 'base64'
      content,
      encoding: 'utf-8'
    }
    const postContentsBody = JSON.stringify(postContents)

    // blobの作成
    const createBlobRes = await fetch(
      `http://localhost:8085/.netlify/git/github/git/blobs?ref=${branchName}`,
      { method: postMethod, headers, body: postContentsBody }
    )
    const blobRes = await createBlobRes.json()
    console.log(':q~', blobRes)

    // // const masmaster = await fetch('http://localhost:8085/.netlify/git/github/branches/master', {method: getMethod, headers})
    // // const masres = await masmaster.json()
    // console.log(commitres.sha, masres.commit.sha) 同じ値
    const fileInfo = {
      base_tree: commitres.commit.tree.sha,
      tree: [
        {
          path: 'test.csv',
          mode: '100644', // 100644  100755 , 040000 160000  シンボリックリンクのパス120000
          type: 'blob',
          sha: blobRes.sha
        }
      ]
    }

    // treeの作成
    const postFileInfoBody = JSON.stringify(fileInfo)
    const createTreeRes = await fetch(
      'http://localhost:8085/.netlify/git/github/git/trees',
      { method: postMethod, headers, body: postFileInfoBody }
    )
    const treeRes = await createTreeRes.json()
    console.log('branchesres', treeRes)
    console.log('check', blobRes.sha, treeRes.sha, parseRef.object.sha)
    const date = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    // console.log('time', date)

    const postCommitInfo = {
      message: date,
      author: {
        name: userName,
        email: userEmail,
        date
      },
      parents: [parseRef.object.sha],
      tree: treeRes.sha
    }
    // console.log()
    // const postCommitInfoBody = postCommitInfo
    const postCommitInfoBody = JSON.stringify(postCommitInfo)
    console.log(postCommitInfoBody)

    // commitの作成
    const createCommitRes = await fetch(
      `http://localhost:8085/.netlify/git/github/git/commits?ref=${branchName}`,
      { method: postMethod, headers, body: postCommitInfoBody }
    )
    const createdCommitRes = await createCommitRes.json()
    console.log('commithash', createdCommitRes.sha)

    // refの更新
    const updateRef = {
      sha: createdCommitRes.sha,
      force: false // 強制pushするか否
    }
    const updateRefs = JSON.stringify(updateRef)
    const updateRefRes = await fetch(
      `http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`,
      { method: patchMethod, headers, body: updateRefs }
    )
    const updatedRefRes = await updateRefRes.json()
    console.log('asdf', updatedRefRes)
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

export function convertObjToCsv(arr) {
  const contents = []

  for (const property in arr) {
    contents.push(
      arr[`${property}`].src +
        ',' +
        arr[`${property}`].subj +
        ',' +
        arr[`${property}`].tool_type +
        ',' +
        arr[`${property}`].period +
        ',' +
        arr[`${property}`].year +
        ',' +
        arr[`${property}`].content_type +
        ',' +
        arr[`${property}`].author +
        ',' +
        arr[`${property}`].image_index +
        ',' +
        arr[`${property}`].included_pages_num +
        ',' +
        arr[`${property}`].fix_text
    )
  }
  const csvHeaders = `src,subj,tool_type,period,year,content_type,author,image_index,included_pages_num,fix_text\n`
  const unionCsv = contents.join(`\n`)
  const convertedCsvFile = csvHeaders + unionCsv
  return convertedCsvFile
  // const array = [Object.keys(arr[0])].concat(arr)
  // return array
  //   .map(it => {
  //     return Object.values(it).toString()
  //   })
  //   .join('\n')
}

export function convertCsvToObj(csv) {
  // headerNames:CSV1行目の項目 :csvRows:項目に対する値
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
