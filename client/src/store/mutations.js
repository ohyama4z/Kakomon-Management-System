export default {
  // setStatusLoading: (state, req) => {
  //   req.status = 'loading'
  // },

  setStatus: (state, payload) => {
    state[payload.path].status = payload.status
  },

  upload: (state, newFile) => {
    state.files.push(newFile)
  },

  setBranches: (state, data) => {
    state.metadata = {
      status: 'loaded',
      branches: data
    }
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

  setMetadatas: (state, res) => {
    const branches = JSON.parse(JSON.stringify(res))
    state.metadatas = {
      status: 'loaded',
      data: branches
    }
    state.branches.data = res.reduce((pre, branch) => {
      if (pre[branch.name] == null) {
        pre[branch.name] = {}
      }
      pre[branch.name] = branch.commit.sha
      return pre
    }, {})
  },

  setCsvObj: (state, csvObj) => {
    state.setCsvObj.status = 'loaded'
    state.files = csvObj
  },

  saveBase64EncodedCsv: (state, data) => {
    if (state.setCsvObj.unparsedData[data.branchName] == null) {
      state.setCsvObj.unparsedData[data.branchName] = {}
    }
    state.setCsvObj.unparsedData[data.branchName][data.fileName] =
      data.branchData
  }
}
