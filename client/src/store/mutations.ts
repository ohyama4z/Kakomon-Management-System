import { MutationTree } from 'vuex'
import { PendingStatus, State, Status } from './state'

export interface Mutations extends MutationTree<State> {
  updateCurrentUser: (state: State, user: State['currentUser']) => void
  updateLastPage: (state: State) => void
  setBranches: (
    state: State,
    payload: { branches: State['branches']['data'] }
  ) => void
  setBranchesStatus: (state: State, payload: { status: Status }) => void
  setCurrentBranch: (state: State, branchName: string) => void
  setCommit: (
    state: State,
    poyload: { sha: string; data: State['commits']['']['data'] }
  ) => void
  setCommitStatus: (
    state: State,
    payload: { sha: string; status: PendingStatus }
  ) => void
  setContentMetadata: (
    state: State,
    payload: { sha: string; data: State['contentMetadatas']['']['data'] }
  ) => void
  setContentMetadataStatus: (
    state: State,
    payload: { sha: string; status: PendingStatus }
  ) => void
  setExpand: (state: State, expand: boolean) => void
  setImageShas: (
    state: State,
    payload: {
      commitSha: string
      directoryPath: string
      data: State['imageShas']['']['']['data']
    }
  ) => void
  setImageData: (
    state: State,
    payload: { sha: string; blobUri: string }
  ) => void
  setDisplayedFiles: (state: State, filePaths: string[]) => void
  setChangedFilesBase: (state: State, files: State['changedFiles']) => void
  setChangedFiles: (state: State, files: State['changedFiles']['']) => void
  setSelectedFiles: (state: State, selectedFiles: string[]) => void
  updateChangedFileIndex: (
    state: State,
    payload: { filename: string; index: string }
  ) => void
  setCommitCsvStatus: (state: State, payload: { status: Status }) => void
  clearChangedFilesAndSelectedFiles: (state: State) => void
}

const mutations: Mutations = {
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
    if (payload.status !== 'loading') {
      state.branches = {
        ...state.branches,
        status: 'invalied_status'
      }
      return
    }
    state.commits = {
      ...state.commits,
      [payload.sha]: {
        data: {},
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
    if (payload.status !== 'loading') {
      state.branches = {
        ...state.branches,
        status: 'invalied_status'
      }
      return
    }
    state.contentMetadatas = {
      ...state.contentMetadatas,
      [payload.sha]: {
        data: {},
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
        ...files,
        included_pages_num: '1'
      }
    })
  },

  setSelectedFiles: (state, selectedFiles) => {
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
