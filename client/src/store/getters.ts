type Getters = {
  [key in string]: (state: any) => any
}

export default {
  currentBranchMetadatas: state => {
    const branch = state.currentBranch
    const branches = state.branches
    const commits = state.commits
    const contentMetadatas = state.contentMetadatas

    if (branches.status !== 'loaded') {
      console.log(
        `branches is ${branches.status}, skip generating branch metadatas`
      )
      return { status: 'loading', data: {} }
    }

    const commitSha = branches?.data?.[branch]
    if (commits[commitSha]?.status !== 'loaded') {
      console.log(
        `commits is ${commits[commitSha]?.status}, skip generating metadatas`
      )
      return { status: 'loading', data: {} }
    }

    const loadedContentMetadataShas = Object.values(
      state.commits[commitSha].data
    ).filter(sha => contentMetadatas[sha]?.status === 'loaded')

    if (
      loadedContentMetadataShas.length !==
      Object.values(state.commits[commitSha].data).length
    ) {
      return { status: 'loading', data: {} }
    }

    const loadedMetadatas = loadedContentMetadataShas.flatMap(sha => {
      return Object.entries(contentMetadatas[sha]?.data).map(([key, value]) => {
        return { [key]: { ...value, sha } }
      })
    })

    const contentMetadatasBySource = loadedMetadatas.flatMap(loadedMetadata =>
      Object.entries(loadedMetadata)
    )

    const result = Object.fromEntries(contentMetadatasBySource)

    return { status: 'loaded', data: result }
  }
} as Getters
