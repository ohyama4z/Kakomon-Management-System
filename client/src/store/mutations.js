export default {
  upload: (state, newFile) => {
    state.files.push(newFile)
  },

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
    if (state.commits[payload.sha] == null) {
      state.commits[payload.sha] = {
        status: '',
        data: {}
      }
    }
    state.commits[payload.sha].status = payload.status
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
    state.contentMetadatas = {
      ...state.contentMetadatas,
      [payload.sha]: {
        status: payload.status
      }
    }
  }
}
