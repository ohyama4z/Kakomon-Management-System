import type { GetterTree } from 'vuex'
import type { State } from './state'

interface CurrentBranchMetadatas {
  status: 'loaded' | 'loading'
  data: {
    [key: string]: State['contentMetadatas']['']['data'][''] & {
      csvFile: string
      sha: string
    }
  }
}
export interface Getters {
  currentBranchMetadatas: CurrentBranchMetadatas
  subjects: string[]
}

const getters: GetterTree<Readonly<State>, unknown> = {
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
    ).filter((sha: any) => contentMetadatas[sha]?.status === 'loaded')

    if (
      loadedContentMetadataShas.length !==
      Object.values(state.commits[commitSha].data).length
    ) {
      return { status: 'loading', data: {} }
    }

    const loadedMetadatas = loadedContentMetadataShas.flatMap((sha: any) => {
      return Object.entries(contentMetadatas[sha]?.data).map(([key, value]) => {
        return { [key]: { ...(value as object), sha } }
      })
    })

    const contentMetadatasBySource = loadedMetadatas.flatMap(loadedMetadata =>
      Object.entries(loadedMetadata)
    )

    const result = Object.fromEntries(contentMetadatasBySource)

    return { status: 'loaded', data: result }
  },

  subjects: (_, getters: Getters) => {
    const set = new Set<string>()
    Object.entries(getters.currentBranchMetadatas.data).map(([, v]) => {
      set.add(v.subj)
    })

    return [...set]
  }
}

export default getters
