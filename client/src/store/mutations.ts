import { MutationTree } from 'vuex'
import { State } from './state'

const mutations: MutationTree<State> = {
  updateCurrentUser: (state, user) => {
    state.currentUser = user
  },

  updateLastPage: state => {
    const lastPageInStrage = localStorage.getItem('lastPage')
    const lastPage = lastPageInStrage == null ? 'upload' : lastPageInStrage
    if (state.lastPage === '') {
      state.lastPage = lastPage
    }
    console.log(`next page after loging in is ${state.lastPage}`)
  },

  setBranches: (state, payload) => {
    state.branches = {
      ...state.branches,
      status: 'loaded',
      data: payload.branches
    }
  },

  setBranchesStatus: (state, payload) => {
    if (payload.status !== 'loading' && payload.status !== 'loaded') {
      state.branches = {
        ...state.branches,
        status: 'invalied_status'
      }
      return
    }
    state.branches = {
      ...state.branches,
      status: payload.status
    }
  },

  setCurrentBranch: (state, branchName) => {
    state.currentBranch = branchName
  },

  setCommit: (state, payload) => {
    state.commits = {
      ...state.commits,
      [payload.sha]: {
        status: 'loaded',
        data: payload.data
      }
    }
  },

  setCommitStatus: (state, payload) => {
    if (payload.status !== 'loading' && payload.status !== 'loaded') {
      state.branches = {
        ...state.branches,
        status: 'invalied_status'
      }
      return
    }
    state.commits = {
      ...state.commits,
      [payload.sha]: {
        status: payload.status
      }
    }
  },

  setContentMetadata: (state, payload) => {
    state.contentMetadatas = {
      ...state.contentMetadatas,
      [payload.sha]: {
        status: 'loaded',
        data: payload.data
      }
    }
  },

  setContentMetadataStatus: (state, payload) => {
    if (payload.status !== 'loading' && payload.status !== 'loaded') {
      state.branches = {
        ...state.branches,
        status: 'invalied_status'
      }
      return
    }
    state.contentMetadatas = {
      ...state.contentMetadatas,
      [payload.sha]: {
        status: payload.status
      }
    }
  },

  setExpand: (state, expand) => {
    state.expand = expand
  },

  setImageShas: (state, payload) => {
    state.imageShas = {
      ...state.imageShas,
      [payload.commitSha]: {
        ...state.imageShas[payload.commitSha],
        [payload.directoryPath]: {
          status: 'loaded',
          data: payload.data
        }
      }
    }
  },

  setImageData: (state, payload) => {
    state.imageDatas = {
      ...state.imageDatas,
      [payload.sha]: {
        status: 'loaded',
        data: payload.blobUri
      }
    }
  },

  setDisplayedFiles: (state, filePaths) => {
    state.displayedFiles = filePaths
  },

  setChangedFilesBase: (state, files) => {
    state.changedFiles = { ...files }
  },

  setChangedFiles: (state, files) => {
    state.selectedFiles.map(filename => {
      state.changedFiles[filename] = {
        ...state.changedFiles[filename],
        ...files
      }
    })
  },

  setSelectedFiles: (state, selectedFiles: string[]) => {
    state.selectedFiles = selectedFiles
  },

  updateChangedFileIndex: (state, payload) => {
    state.changedFiles = {
      ...state.changedFiles,
      [payload.filename]: {
        ...state.changedFiles[payload.filename],
        image_index: payload.index
      }
    }
  },

  setCommitCsvStatus: (state, payload) => {
    state.commitStatus = payload.status
  },

  clearChangedFilesAndSelectedFiles: state => {
    state.changedFiles = {}
    state.selectedFiles = []
  },

  notify: (state, payload) => {
    state.notifications = [...state.notifications, payload.message]
  },

  syncNotificationsChange: (state, payload) => {
    state.notifications = payload.messages
  }
}

export default mutations
