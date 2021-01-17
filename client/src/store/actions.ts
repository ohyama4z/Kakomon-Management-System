import merge from 'deepmerge'
import moment from 'moment'
// @ts-ignore
import netlifyIdentity from 'netlify-identity-widget'
import { ActionContext, ActionTree } from 'vuex'
import { Mutations } from './mutations'
import { State } from './state'

const url = process.env.VUE_APP_URL

// https://dev.to/3vilarthas/vuex-typescript-m4j

interface AugmentedActionContext
  extends ActionContext<Readonly<State>, unknown> {
  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>

  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Actions[K] extends (...args: any[]) => any
      ? Parameters<Actions[K]>[1]
      : unknown
  ): Actions[K] extends (...args: any[]) => Promise<any>
    ? ReturnType<Actions[K]>
    : Promise<unknown>
}

export interface Actions extends ActionTree<Readonly<State>, unknown> {
  getBranches: (context: AugmentedActionContext) => Promise<void>
  selectBranch: (
    context: AugmentedActionContext,
    payload: string
  ) => Promise<void>
  getToken: (context: AugmentedActionContext) => Promise<string>
  getEmail: (context: AugmentedActionContext) => Promise<string>
  getCommit: (
    context: AugmentedActionContext,
    commitSha: string
  ) => Promise<void>
  getContentMetadata: (
    context: AugmentedActionContext,
    payload: { fileSha: string; filename: string }
  ) => Promise<void>
  postCommitCsv: (context: AugmentedActionContext) => Promise<void>
  updateCurrentUser: (context: AugmentedActionContext) => Promise<void>
  getImageShas: (
    context: AugmentedActionContext,
    payload: {
      commitSha: string
      directoryPath: string
    }
  ) => Promise<void>
  getImageDatas: (
    context: AugmentedActionContext,
    fileSha: string
  ) => Promise<void>
  createBranch: (
    context: AugmentedActionContext,
    branch: string
  ) => Promise<void>
  upload: (
    context: AugmentedActionContext,
    payload: {
      branch: string
      files: { [k: string]: string }
      commitMessage: string
    }
  ) => Promise<void>
  createCommit: (
    context: AugmentedActionContext,
    payload: {
      commitSha: string
      branch: string
      files: { [k: string]: string }
      commitMessage: string
    }
  ) => Promise<void>
}

const actions: Actions = {
  getBranches: async ({ commit, dispatch }) => {
    commit('setBranchesStatus', { status: 'loading' })
    const token = await dispatch('getToken')
    const getMethod = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const httpRes = await fetch(`${url}/github/branches`, {
      method: getMethod,
      headers
    })
    interface Res {
      name: string
      commit: { sha: string }
    }
    const res = (await httpRes.json()) as Res[]

    const branches = Object.fromEntries(
      res.map(branch => [branch.name, branch.commit.sha])
    )
    commit('setBranches', { branches: { master: '', ...branches } })
  },

  selectBranch: async ({ dispatch, commit, state }, branchName) => {
    commit('setCurrentBranch', branchName)
    await dispatch('getBranches')
    const commitSha = state.branches.data[branchName]
    await dispatch('getCommit', commitSha)
  },

  getToken: async ({ state }) => {
    // eslint-disable-next-line camelcase
    const token = state.currentUser?.token?.access_token
    if (token == null) {
      throw new Error('state.currentUser?.token?.access_token == null')
    }
    return token
  },

  getEmail: async ({ state }) => {
    const email = state.currentUser?.email
    if (email == null) {
      throw new Error('state.currentUser?.email == null')
    }
    return email
  },

  getCommit: async ({ dispatch, commit, state }, commitSha) => {
    const commitDataInState = state.commits?.[commitSha]
    if (commitDataInState?.status === 'loaded') {
      Object.entries(commitDataInState.data).map(
        async ([name, sha]: string[]) => {
          await dispatch('getContentMetadata', { filename: name, fileSha: sha })
        }
      )

      return
    }

    commit('setCommitStatus', { sha: commitSha, status: 'loading' })

    const commitDataInLocalStorage = JSON.parse(
      localStorage.getItem(commitSha) as string
    ) as { [k: string]: string } | null
    if (commitDataInLocalStorage != null) {
      commit('setCommit', {
        sha: commitSha,
        data: commitDataInLocalStorage
      })
      await Promise.all([
        Object.entries(commitDataInLocalStorage).map(async ([name, sha]) => {
          await dispatch('getContentMetadata', {
            filename: name,
            fileSha: sha
          })
        })
      ])

      return
    }

    const token = await dispatch(`getToken`)
    const getMethod = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const httpRes = await fetch(
      `${url}/github/contents/metadatas?ref=${commitSha}`,
      { method: getMethod, headers }
    )
    interface Res {
      name: string
      sha: string
    }
    const res = (await httpRes.json()) as Res[]

    const commitData = Object.fromEntries(
      res.map(file => [file.name, file.sha])
    ) as { [k: string]: string }

    Object.entries(commitData).map(async ([name, sha]) => {
      await dispatch('getContentMetadata', { filename: name, fileSha: sha })
    })

    commit('setCommit', {
      sha: commitSha,
      data: commitData
    })

    localStorage.setItem(`${commitSha}`, JSON.stringify(commitData))
  },

  getContentMetadata: async ({ commit, state, dispatch }, payload) => {
    const fileDataInState = state.contentMetadatas?.[payload.fileSha]
    if (fileDataInState?.status === 'loaded') {
      return
    }

    commit('setContentMetadataStatus', {
      sha: payload.fileSha,
      status: 'loading'
    })

    const fileDataInLocalStorage = JSON.parse(
      localStorage.getItem(payload.fileSha) as string
    ) as State['contentMetadatas']['']['data']
    if (fileDataInLocalStorage != null) {
      commit('setContentMetadata', {
        sha: payload.fileSha,
        data: fileDataInLocalStorage
      })
      return
    }

    const token = await dispatch('getToken')
    const getMethod = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const httpRes = await fetch(`${url}/github/git/blobs/${payload.fileSha}`, {
      method: getMethod,
      headers
    })
    interface Res {
      content: string
    }
    const res = (await httpRes.json()) as Res

    const csvHttpRes = await fetch(`data:text/plain;base64,${res.content}`)
    const csvData = await csvHttpRes.text()
    const resultObj = convertCsvToObj(csvData, payload.filename)

    commit('setContentMetadata', {
      sha: payload.fileSha,
      data: resultObj
    })

    localStorage.setItem(payload.fileSha, JSON.stringify(resultObj))
  },

  postCommitCsv: async ({ commit, state, dispatch }) => {
    commit('setCommitCsvStatus', { status: 'loading' })
    const token = await dispatch('getToken')

    const getMethod = 'GET'
    const postMethod = 'POST'
    const patchMethod = 'PATCH'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const userEmail = await dispatch('getEmail')
    const userNameLength = userEmail.search('@')
    const userName = userEmail.slice(0, userNameLength)
    const branchName = state.currentBranch

    const newChangedFiles = merge({}, state.changedFiles)

    const list = Object.values(newChangedFiles)

    const csvSrcs: String[] = []
    const csvShas = []

    for (const source of list) {
      csvSrcs.push(source.csvFile)
      csvShas.push(source.sha)
    }
    const setedCsvFileList = Array.from(new Set(csvSrcs))
    const setedCsvShaList = Array.from(new Set(csvShas))

    const filePath = setedCsvFileList[0]
    const csvSha = setedCsvShaList[0]
    // const filePath = state.changedFiles[0].csvFile // todo:いずれ複数に対応させる
    // const csvSha = state.changedFiles[0].csvSha // todo:いずれ複数に対応させる

    const newContentMetadata = merge(
      state.contentMetadatas[csvSha].data,
      {}
    ) as typeof state.contentMetadatas['']['data']
    const exchangeFile = merge(
      {},
      state.changedFiles
    ) as typeof state.changedFiles

    const editedCsvObj = merge(newContentMetadata, exchangeFile) as Pick<
      typeof newContentMetadata,
      keyof typeof exchangeFile
    >

    // editedobject→csv
    const content =
      '\ufeff' + convertObjToCsv(Object.values(editedCsvObj)) + '\n'

    try {
      // refの取得
      const refRes = await fetch(`${url}/github/git/refs/heads/${branchName}`, {
        method: getMethod,
        headers
      })
      // ステータス200以外
      if (!refRes.ok) {
        throw new Error(refRes.statusText)
      }

      interface ParseRef {
        object: { sha: string }
      }
      const parseRef = (await refRes.json()) as ParseRef
      const hash = parseRef.object.sha
      // commitの取得
      const commitRes = await fetch(`${url}/github/commits/${hash}`, {
        method: getMethod,
        headers
      })
      // ステータス200以外
      if (!commitRes.ok) {
        throw new Error(commitRes.statusText)
      }

      interface CommitRes {
        commit: {
          tree: { sha: string }
        }
      }
      const commitres = (await commitRes.json()) as CommitRes

      const postContents = {
        content,
        encoding: 'utf-8'
      }
      const postContentsBody = JSON.stringify(postContents)

      // blobの作成
      const createBlobRes = await fetch(
        `${url}/github/git/blobs?ref=${branchName}`,
        {
          method: postMethod,
          headers,
          body: postContentsBody
        }
      )
      // ステータス200以外
      if (!createBlobRes.ok) {
        throw new Error(createBlobRes.statusText)
      }

      interface BlobRes {
        sha: string
      }
      const blobRes = (await createBlobRes.json()) as BlobRes
      const fileInfo = {
        base_tree: commitres.commit.tree.sha,
        tree: [
          {
            path: `metadatas/${filePath}`,
            mode: '100644',
            type: 'blob',
            sha: blobRes.sha
          }
        ]
      }

      // treeの作成
      const postFileInfoBody = JSON.stringify(fileInfo)

      const createTreeRes = await fetch(`${url}/github/git/trees`, {
        method: postMethod,
        headers,
        body: postFileInfoBody
      })
      // ステータス200以外
      if (!createTreeRes.ok) {
        throw new Error(createTreeRes.statusText)
      }

      interface TreeRes {
        sha: string
      }
      const treeRes = (await createTreeRes.json()) as TreeRes
      const date = moment().format('YYYY-MM-DDTHH:mm:ssZ')

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
      const postCommitInfoBody = JSON.stringify(postCommitInfo)

      // commitの作成
      const createCommitRes = await fetch(
        `${url}/github/git/commits?ref=${branchName}`,
        { method: postMethod, headers, body: postCommitInfoBody }
      )
      // ステータス200以外
      if (!createCommitRes.ok) {
        throw new Error(createCommitRes.statusText)
      }

      interface CreateCommitRes {
        sha: string
      }
      const createdCommitRes = (await createCommitRes.json()) as CreateCommitRes

      // refの更新
      const updateRef = {
        sha: createdCommitRes.sha,
        force: false // 強制pushするか否
      }
      const updateRefs = JSON.stringify(updateRef)

      const updateRefsRes = await fetch(
        `${url}/github/git/refs/heads/${branchName}`,
        {
          method: patchMethod,
          headers,
          body: updateRefs
        }
      )
      // ステータス200以外
      if (!updateRefsRes.ok) {
        throw new Error(updateRefsRes.statusText)
      }
      await fetch(`${url}/github/git/refs/heads/${branchName}`, {
        method: patchMethod,
        headers,
        body: updateRefs
      })

      commit('setCommitCsvStatus', { status: 'loaded' })
    } catch (e) {
      const errorMessage = e
      dispatch('notify', errorMessage.message)
      commit('setCommitCsvStatus', { status: 'failed' })
    }
  },

  updateCurrentUser: async ({ commit }) => {
    const user = netlifyIdentity.currentUser()
    // eslint-disable-next-line camelcase
    if (user != null && user.token?.access_token == null) {
      await (netlifyIdentity as any).refresh()
    }
    commit('updateCurrentUser', user)
  },

  getImageShas: async (
    { state, commit, dispatch },
    { commitSha, directoryPath }
  ) => {
    if (state.imageShas?.[commitSha]?.[directoryPath]?.status === 'loaded') {
      return
    }
    const token = await dispatch('getToken')
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const httpRes = await fetch(
      `${url}/github/contents/${directoryPath}?ref=${commitSha}`,
      { method, headers }
    )
    interface Res {
      name: string
      sha: string
      // eslint-disable-next-line camelcase
      download_url: string
    }
    const res = (await httpRes.json()) as Res[]

    const data = Object.fromEntries(
      res.map(file => [file.name, { sha: file.sha, url: file.download_url }])
    )
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

    const filenames = Object.values(files).map(file => {
      const path = file.src
      return path.substr(path.lastIndexOf('/') + 1)
    })

    await Promise.all(
      filenames.map(async filename => {
        const sha = state.imageShas[commitSha][directoryPath].data[filename]
        const token = await dispatch('getToken')
        const method = 'GET'
        const headers = {
          Authorization: `Bearer ${token}`
        }
        const httpRes = await fetch(`${url}/github/git/blobs/${sha}`, {
          method,
          headers
        })
        interface Res {
          content: string
        }
        const res = (await httpRes.json()) as Res

        // Todo: image/ だけじゃなくpdfとかもあるので対応できるようにする
        const imageType = filename.substr(filename.lastIndexOf('.') + 1)
        const blob = toBlob(res.content, imageType)
        const blobUri = URL.createObjectURL(blob)

        commit('setImageData', { sha, blobUri, downloadUrl })
      })
    )
  },

  createBranch: async ({ commit, dispatch }, branch) => {
    commit('setBranchesStatus', { status: 'loading' })
    const token = await dispatch('getToken')
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const httpRes = await fetch(`${url}/github/git/refs/heads/master`, {
      method,
      headers
    })
    interface Res {
      object: { sha: string }
    }
    const res = (await httpRes.json()) as Res
    const masterSha = res.object.sha

    // branchの作成
    const body = JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: `${masterSha}`
    })

    await fetch(`${url}/github/git/refs`, {
      method: 'POST',
      headers,
      body
    })

    console.log(`created new branch: ${branch}`)
  },

  upload: async ({ state, dispatch }, payload) => {
    const commitSha = state.branches.data[payload.branch]
    const createCommitPayload = {
      commitSha: commitSha,
      branch: payload.branch,
      files: payload.files,
      commitMessage: payload.commitMessage
    }
    await dispatch('createCommit', createCommitPayload)
  },

  createCommit: async ({ dispatch }, payload) => {
    // https://int128.hatenablog.com/entry/2017/09/05/161641 詳しくはここ見ろ
    const token = await dispatch('getToken')
    const headers = {
      Authorization: `Bearer ${token}`
    }

    const commitHttpRes = await fetch(
      `${url}/github/git/commits/${payload.commitSha}`,
      {
        method: 'GET',
        headers
      }
    )
    interface CommitRes {
      tree: { sha: string }
    }
    const commitRes = (await commitHttpRes.json()) as CommitRes

    const csvBlobSha = await getCsvBlobSha(token, {
      files: payload.files,
      branch: payload.branch
    })

    const treeMetadatas = await Promise.all(
      Object.entries(payload.files).map(
        async ([filename, blobUri]: [string, string]) => {
          const httpBlob = await fetch(`${blobUri}`)
          const blob = await httpBlob.blob()
          const base64 = await readFileAsync(blob)

          const blobShaHttpRes = await fetch(
            `${url}/github/git/blobs?ref=${payload.branch}`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                content: base64,
                encoding: 'base64'
              })
            }
          )
          interface BlobShaRes {
            sha: string
          }
          const blobShaRes = (await blobShaHttpRes.json()) as BlobShaRes

          return { filename, sha: blobShaRes.sha }
        }
      )
    )

    const imagesTree = treeMetadatas.map(data => {
      return {
        path: `scanned/${data.filename}`,
        mode: '100644',
        type: 'blob',
        sha: data.sha
      }
    })
    const day = moment().format('YYYY-MM-DD_HHmmss')
    const csvTree = [
      {
        path: `metadatas/unassorted_${day}_${payload.commitMessage}.csv`,
        mode: '100644',
        type: 'blob',
        sha: csvBlobSha
      }
    ]
    const tree = [...imagesTree, ...csvTree]
    const treeData = {
      base_tree: commitRes.tree.sha,
      tree: tree
    }
    const createTreeHttpRes = await fetch(`${url}/github/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify(treeData)
    })
    interface CreateTreeRes {
      sha: string
    }
    const createTreeRes = (await createTreeHttpRes.json()) as CreateTreeRes

    const email = await dispatch('getEmail')
    const name = email.substr(0, email.lastIndexOf('@'))
    const createCommitBody = {
      message: payload.commitMessage,
      author: {
        name,
        email,
        date: moment().format('YYYY-MM-DDTHH:mm:ssZ')
      },
      parents: [payload.commitSha],
      tree: createTreeRes.sha
    }
    const createCommitHttpRes = await fetch(
      `${url}/github/git/commits?ref=${payload.branch}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(createCommitBody)
      }
    )
    interface CreateCommitRes {
      sha: string
    }
    const createCommitRes = (await createCommitHttpRes.json()) as CreateCommitRes

    await fetch(`${url}/github/git/refs/heads/${payload.branch}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: createCommitRes.sha,
        force: false
      })
    })
  },

  notify: ({ commit }, message: string) => {
    commit('notify', { message })
  },

  syncNotificationsChange: ({ commit }, messages: string[]) => {
    commit('syncNotificationsChange', { messages })
  }
}

export function convertObjToCsv(
  arr: Readonly<State['contentMetadatas']['']['data'][''][]>
) {
  const contents: string[] = []

  for (const property in arr) {
    contents.push(
      arr[property].src +
        ',' +
        arr[property].subj +
        ',' +
        arr[property].tool_type +
        ',' +
        arr[property].period +
        ',' +
        arr[property].year +
        ',' +
        arr[property].content_type +
        ',' +
        arr[property].author +
        ',' +
        arr[property].image_index +
        ',' +
        arr[property].included_pages_num +
        ',' +
        arr[property].fix_text
    )
  }
  const headerOfCsv = `src,subj,tool_type,period,year,content_type,author,image_index,included_pages_num,fix_text\n`
  const integrationCsv = contents.join(`\n`)
  const convertedCsvFile = headerOfCsv + integrationCsv
  return convertedCsvFile
}

export function convertCsvToObj(csv: string, filename: string) {
  type PreObj = {
    [key: string]: string
  }
  interface ResultObj {
    [src: string]: State['contentMetadatas']['']['data']['']
  }
  // headerNames:CSV1行目の項目 :csvRows:項目に対する値
  const [headerNames, ...csvRows] = csv
    .split('\n')
    .filter(row => row !== '')
    .map(row => {
      return row.split(',')
    })

  return csvRows
    .map(r => {
      return (
        headerNames
          // .map((headerName, index) => {
          //   return { key: headerName.replace(/\s+/g, ''), value: r[index] }
          // })
          .reduce((previous, headerName, i) => {
            previous[headerName.replace(/\s+/g, '')] = r[i]
            return previous
          }, {} as PreObj)
      )
    })
    .filter(assertIsCsvRow)
    .reduce((previous, row) => {
      const newRow = {
        ...row,
        csvFile: filename
      }
      previous[row.src] = newRow
      return previous
    }, {} as ResultObj)
}

function assertIsCsvRow(
  row: any
): row is Omit<State['contentMetadatas']['']['data'][''], 'csvFile'> {
  return row.src != null
}

function toBlob(base64: string, type: string) {
  const bin = atob(base64.replace(/^.*,/, ''))
  const buffer = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i)
  }
  // Blobを作成

  return new Blob([buffer.buffer], { type })
}

export function readFileAsync(blob: Blob) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        throw new Error("typeof reader.result !== 'string'")
      }
      const base64 = reader.result.replace(/$data:.*\/.*;base64,/, '')
      resolve(base64)
    }
    reader.readAsDataURL(blob)
  })
}

interface Payload {
  files: { [k: string]: unknown }
  branch: string
}
export async function getCsvBlobSha(token: string, payload: Readonly<Payload>) {
  const headerRow = `src,subj,tool_type,period,year,content_type,author,image_index,included_pages_num,fix_text\n`
  const sortedFiles = Object.keys(payload.files).sort()
  const filesRows = sortedFiles.reduce((p, src) => {
    p += `scanned/${src},,,,,,,,,\n`
    return p
  }, '')
  const csv = headerRow + filesRows

  const headers = {
    Authorization: `Bearer ${token}`
  }

  const blobShaHttpRes = await fetch(
    `${url}/github/git/blobs?ref=${payload.branch}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: csv,
        encoding: 'utf-8'
      })
    }
  )
  interface BlobShaRes {
    sha: string
  }
  const blobShaRes = (await blobShaHttpRes.json()) as BlobShaRes

  return blobShaRes.sha
}

export default actions
