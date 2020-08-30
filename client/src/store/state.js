import netlifyIdentity from 'netlify-identity-widget'

export default {
  currentUser: netlifyIdentity.currentUser(),
  lastPage: '',
  currentBranch: '',
  expand: true,

  commits: {},
  contentMetadatas: {},

  changedFiles: {},

  branches: {
    status: 'unrequested',
    data: {}
  },

  imageDatas: {},
  imageShas: {},
  displayedFiles: []
}
