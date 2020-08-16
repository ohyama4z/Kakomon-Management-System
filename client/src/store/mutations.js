export default {
  setStatusLoading: (state, req) => {
    req.status = 'loading'
  },
  upload: (state, newFile) => {
    state.files.push(newFile)
  },

  setBranches: (state, data) => {
    state.metadata = {
      status: 'loaded',
      branches : data,
    }
  },

  updateCurrentUser: (state, user) => {
    state.currentUser = user
  },

  updateLastPage: (state) => {
    const lastPageInStrage = localStorage.getItem('lastPage')
    const lastPage = lastPageInStrage == null ? 'upload' : lastPageInStrage
    state.lastPage = lastPage
    console.log(`next page after loging in is ${state.lastPage}`)
  },

  getBranches: (state, res) => {
    console.log(res)
    const branches = JSON.parse(JSON.stringify(res))
    state.metadatas = {
      status: 'loaded',
      data: branches
    }
  },

  setCsvObj: (state, csvObj) => {
    state.setCsvObj.status = 'loaded'
    state.files = csvObj
  },

  branchDataOnGithub: (state, data) =>{
    if (state.setCsvObj.unparsedData[data.branchName] == null){
      state.setCsvObj.unparsedData[data.branchName] = {}
    }
    state.setCsvObj.unparsedData[data.branchName][data.fileName] = data.branchData
  },
}