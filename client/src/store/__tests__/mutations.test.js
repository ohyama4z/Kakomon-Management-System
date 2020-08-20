import mutations from '../mutations';
const state = {
  lastPage: '',
  currentBranch: '',

  commits: {},
  contentMetadatas: {},

  branches: {
    status: 'unrequested',
    data: {}
  }
}

describe('mutations.js', () => {
  beforeEach(() => {
    delete state.commits
    delete state.contentMetadatas
  })
  it('updatecurrentUser', () => {
    const state = { currentUser: jest.fn() }
    const user = 'hogetarou'
    mutations.updateCurrentUser(state, user)
    expect(state.currentUser).toBe('hogetarou')

  })

  it('updateLastPage', () => {
    beforeEach(() => {
      localStorage.clear();
    });
  
    // const lastPageInStrage = 'test'
    // const lastPage = null
    // const state = 'hoge'
    const state = { lastPage: '' }

    mutations.updateLastPage(state)
    // console.log(':p~', mutations.updateLastPage)

    expect(state.lastPage).toEqual('upload')
  })

  // it('setBranches', () => {
  //   const payload = 'asdf'
  //   const state = { branches: { status: '', branches: '' } }
  //   mutations.setBranches(state, payload)
  //   console.log('hoge', state, state.metadata.status)

  //   expect(state.branches.status).toBe('loaded')
  //   expect(state.branches.branches).toEqual('asdf')
  // })

  it('setBranchesStatus(payload.statusがloadingでもloadedでもない時)', () => {
    console.log('51', state.branches)
    state.branches = {
      status: 'loading',
    }
    console.log('55', state.branches)
    // const payload = {
    //   status: 'unrequested'
    // }
    const payloadForSetStatusBranches = {
      // branches: {
      //   ...state.branches,
      // },
      status: 'unrequested',
    }
    const resultForSetStatusBranches = {
      status: 'invalied_status',
      data: {}
    }
    mutations.setBranchesStatus(state, payloadForSetStatusBranches)
    console.log('51', state.branches)
    expect(state.branches.status).toEqual(resultForSetStatusBranches.status)
    // expect(state.branches).toEqual(resultForSetStatusBranches)
  })

  // it('getBranches', () => {
  //   const state = { metadatas: { status: '', data: '' } }
  //   const res = { a: 'b', c: 'd' }
  //   mutations.getBranches(state, res)
  //   expect(state.metadatas.status).toBe('loaded')
  //   expect(state.metadatas.data).toEqual({ a: 'b', c: 'd' })
  // })
  it('setBranchesStatus(payload.statusがlaodingかloadedの時)', () => {
    console.log('51', state.branches)
    state.branches = {
      status: 'loading',
    }
    console.log('55', state.branches)
    // const payload = {
    //   status: 'unrequested'
    // }
    const payloadForSetStatusBranches = {
      // branches: {
      //   ...state.branches,
      // },
      status: 'loaded',
    }
    const resultForSetStatusBranches = {
      status: payloadForSetStatusBranches.status,
      data: {}
    }
    mutations.setBranchesStatus(state, payloadForSetStatusBranches)
    console.log('51', state.branches)
    expect(state.branches.status).toEqual(resultForSetStatusBranches.status)
    // expect(state.branches).toEqual(resultForSetStatusBranches)
  })

  
  it('setCurrentBranch', () => {
    const payloadBranchName = 'master'
    mutations.setCurrentBranch(state, payloadBranchName)
    expect(state.currentBranch).toBe('master')
  })

  it('setCommitStatus(payload.statusがloadingでもloadedでもない時)', () => {
    state.branches = {
      status: 'unrequested'
    }
    const resultForSetCommitStatus = {
      branches: {
        status: 'invalied_status',
        data: {}
      }
    }
    const payloadForSetCommitStatus = {
      status: 'unrequested'
    }
    mutations.setCommitStatus(state, payloadForSetCommitStatus)
    console.log(state.branches.status)
    expect(state.branches.status).toBe(resultForSetCommitStatus.branches.status)
  })

  it('setCommitStatus(payload.statusがlaodingかloadedの時)', () => {
    state.branches = {
      status: 'loading'
    }
    const commitsha = 'a1b2'
    const payloadForSetCommitStatus = {
      status: 'loading',
      sha: commitsha
    }
    // console.log('status', state.commits.status)
    mutations.setCommitStatus(state, payloadForSetCommitStatus)
    const resultForSetCommitStatus = {
      branches: {
        status: payloadForSetCommitStatus.status,
        data: {}
      }
    }
    expect(state.commits[payloadForSetCommitStatus.sha].status).toBe(resultForSetCommitStatus.branches.status)
  })

  it('setContentMetadataStatus(payload.statusがloadingでもloadedでもない時)', () => {
    // console.log(state.branches.status)
    state.contentMetadatas = {
      sha: 'asdf1',
      data: 'resultObj'
    }

    const fileSha = 'asdf1234'
    const payloadForSetContentMetaDataStatus = {
      status: 'unrequested',
      sha: fileSha
    }
    const resultForSetContentMetaDataStatus = {
      branches: {
        status: 'invalied_status'
      }
    }

    mutations.setContentMetadataStatus(state, payloadForSetContentMetaDataStatus)
    expect(state.branches.status).toBe(resultForSetContentMetaDataStatus.branches.status)
  })

  it('setContentMetadataStatus(payload.statusがloadingかloadedの時)', () => {
    // console.log(state.branches.status)
    state.contentMetadatas = {
      sha: 'asdf1',
      data: 'resultObj'
    }

    const fileSha = 'asdf1234'
    const payloadForSetContentMetaDataStatus = {
      status: 'loading',
      sha: fileSha
    }
    const resultForSetContentMetaDataStatus = {
      branches: {
        status: payloadForSetContentMetaDataStatus.status
      }
    }

    mutations.setContentMetadataStatus(state, payloadForSetContentMetaDataStatus)
    expect(state.contentMetadatas[payloadForSetContentMetaDataStatus.sha].status).toEqual(resultForSetContentMetaDataStatus.branches.status)
  })

  it('setCommitCSV', () => {
    const state = { setCommitCSV: { status: 'unrequested' } }
    mutations.setCommitCSV(state)
    expect(state.setCommitCSV.status).toEqual('committed')
  })



  // it('setcsvobj', () => {
  //   const state = { setCsvObj: { status: '' }, files: { x: 'y' } }
  //   const csvObj = { x: 'y' }
  //   mutations.setCsvObj(state, csvObj)
  //   expect(state.setCsvObj.status).toBe('loaded')
  //   expect(state.files).toEqual({ x: 'y' })
  // })

  it('ユーザーがeditページを読み込んだ際のbranchの書き換え,commitsの書き換え,contentMetadatasの書き換えまでの一連の流れ', () => {
    state.currentBranch = 'master'
    const payloadForSetBranches = {
      branches: {
        master: 'commitSha1'
      }
    }
    const resultForSetBranches = {
      status: 'loaded',
      data: {
        master: 'commitSha1'
      }
    }

    mutations.setBranches(state, payloadForSetBranches)
    expect(state.branches).toEqual(resultForSetBranches)

    const commitSha = state.branches.data[state.currentBranch]
    const payloadForSetCommit = {
      sha: commitSha,
      data: {
        'file1.csv': 'fileSha1',
        'file2.csv': 'fileSha2'
      }
    }
    const resultForSetCommit = {
      commitSha1: {
        status: 'loaded',
        data: {
          'file1.csv': 'fileSha1',
          'file2.csv': 'fileSha2'
        }
      }
    }

    mutations.setCommit(state, payloadForSetCommit)
    console.log('statecommits', state.commits, resultForSetCommit)
    expect(state.commits).toEqual(resultForSetCommit)

    const currentFile = 'file1.csv'
    const fileSha = state.commits[commitSha].data[currentFile]
    const payloadForSetContentMetaData = {
      sha: fileSha,
      data: {
        'file1-1.jpg': {
          src: 'file1-1.jpg'
        }
      }
    }
    const resultForSetContentMetaData = {
      fileSha1: {
        status: 'loaded',
        data: {
          'file1-1.jpg': {
            src: 'file1-1.jpg'
          }
        }
      }
    }

    mutations.setContentMetadata(state, payloadForSetContentMetaData)
    expect(state.contentMetadatas).toEqual(resultForSetContentMetaData)
  })
})
