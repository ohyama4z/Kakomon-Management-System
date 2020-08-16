const netlifyIdentity = require('netlify-identity-widget')

export default {
  currentUser: netlifyIdentity.currentUser(),
  lastPage: 'upload',
  metadatas: {
    status: 'unrequested',
    data: []
  },

  setCsvObj: {
    status: 'unrequested',
    unparsedData: {}
  },

  files: {}
}
