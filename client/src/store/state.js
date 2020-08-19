const netlifyIdentity = require('netlify-identity-widget')

export default {
  currentUser: netlifyIdentity.currentUser(),
  lastPage: '',
  currentBranch: '',

  commits: {},
  contentMetadatas: {},

  branches: {
    status: 'unrequested',
    data: {}
  }
}
