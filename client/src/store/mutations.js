const netlifyIdentity = require('netlify-identity-widget')

export default {
  setStatusLoading: (state, req) => {
    req.status = 'loading'
  },
  upload: (state, newFile) => {
    state.files.push(newFile)
  },
  setServerSideLanguage: (state, languageName) => {
    state.serverSideLanguage = {
      status: 'loaded',
      name: languageName,
    }
  },

  setBranches: (state, data) => {
    state.metadata = {
      status: 'loaded',
      branches : data,
    }
  },

  getCurrentUser: (state) => {
    const user = netlifyIdentity.currentUser()
    state.currentUser = user
  },

  updateLastPage: (state) => {
    const lastPageInStrage = localStorage.getItem('lastPage')
    console.log("kyz", lastPageInStrage)
    const lastPage = lastPageInStrage == null ? 'upload' : lastPageInStrage
    state.lastPage = lastPage
    console.log('うあ', state.lastPage)
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
  }
}