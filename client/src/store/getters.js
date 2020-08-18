export default {
  currentBranchMetadatas: state => {
    const branch = state.currentBranch
    const branches = state.branches
    const commits = state.commits
    const contentMetadatas = state.contentMetadatas

    const commitSha = state.branches?.data?.[branch]
    console.log(branches.status, commits[commitSha]?.status, contentMetadatas)

    if (branches.status !== 'loaded') {
      console.log('branches')
      return {}
    }

    if (commits[commitSha].status !== 'loaded') {
      console.log('commits')
      return {}
    }

    // const fileShas = Object.values(state.commits.data[commitSha]).map(...)
    return Object.entries(contentMetadatas).reduce(
      (pre, [fileSha, metadata]) => {
        if (fileSha !== commitSha) {
          return pre
        }
        if (metadata.status !== 'loaded') {
          return pre
        }
        Object.entries(metadata.data).map(([fileName, value]) => {
          pre[fileName] = value
        })
        return pre
      },
      {}
    )
  }
}
