const netlifyIdentity = require('netlify-identity-widget')

export default {
  currentUser: netlifyIdentity.currentUser(),
  lastPage: '',
  currentBranch: '',
  metadatas: {
    status: 'unrequested',
    data: []
  },

  setCsvObj: {
    status: 'unrequested',
    unparsedData: {}
  },

  commits: {},
  contentMetadatas: {},

  files: {},
  branches: {
    status: 'unrequested',
    data: {}
  }
}
