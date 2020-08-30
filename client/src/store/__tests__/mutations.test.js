import mutations from '../mutations'
const state = {
  lastPage: '',
  currentBranch: '',
  expand: true,
  commits: {},
  contentMetadatas: {},
  branches: {
    status: 'unrequested',
    data: {}
  },
  changedFiles: {},
  imageShas: {},
  imageDatas: {},
  displayedFiles: []
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
      localStorage.clear()
    })

    const state = { lastPage: '' }

    mutations.updateLastPage(state)

    expect(state.lastPage).toEqual('upload')
  })

  it('setBranchesStatus(payload.statusがloadingでもloadedでもない時)', () => {
    state.branches = {
      status: 'loading'
    }
    const payloadForSetStatusBranches = {
      status: 'unrequested'
    }
    const resultForSetStatusBranches = {
      status: 'invalied_status',
      data: {}
    }
    mutations.setBranchesStatus(state, payloadForSetStatusBranches)

    expect(state.branches.status).toEqual(resultForSetStatusBranches.status)
  })

  it('setBranchesStatus(payload.statusがlaodingかloadedの時)', () => {
    state.branches = {
      status: 'loading'
    }
    const payloadForSetStatusBranches = {
      status: 'loaded'
    }
    const resultForSetStatusBranches = {
      status: payloadForSetStatusBranches.status,
      data: {}
    }
    mutations.setBranchesStatus(state, payloadForSetStatusBranches)
    expect(state.branches.status).toEqual(resultForSetStatusBranches.status)
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
    mutations.setCommitStatus(state, payloadForSetCommitStatus)
    const resultForSetCommitStatus = {
      branches: {
        status: payloadForSetCommitStatus.status,
        data: {}
      }
    }
    expect(state.commits[payloadForSetCommitStatus.sha].status).toBe(
      resultForSetCommitStatus.branches.status
    )
  })

  it('setContentMetadataStatus(payload.statusがloadingでもloadedでもない時)', () => {
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

    mutations.setContentMetadataStatus(
      state,
      payloadForSetContentMetaDataStatus
    )
    expect(state.branches.status).toBe(
      resultForSetContentMetaDataStatus.branches.status
    )
  })

  it('setContentMetadataStatus(payload.statusがloadingかloadedの時)', () => {
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

    mutations.setContentMetadataStatus(
      state,
      payloadForSetContentMetaDataStatus
    )
    expect(
      state.contentMetadatas[payloadForSetContentMetaDataStatus.sha].status
    ).toEqual(resultForSetContentMetaDataStatus.branches.status)
  })

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

  it('サイドバーを開閉した情報をstateに格納する', () => {
    const expand = false
    mutations.setExpand(state, expand)
    expect(state.expand).toBe(false)
  })

  it('画像ファイルのshaの情報の書き換え', () => {
    state.imageShas = {
      commitSha1: {
        dir1: {
          status: 'loaded',
          data: 'aaa'
        }
      }
    }

    const payload = {
      commitSha: 'commitSha2',
      directoryPath: 'dir2',
      data: 'iii'
    }

    const result = {
      commitSha1: {
        dir1: {
          status: 'loaded',
          data: 'aaa'
        }
      },
      commitSha2: {
        dir2: {
          data: 'iii',
          status: 'loaded'
        }
      }
    }

    mutations.setImageShas(state, payload)
    expect(state.imageShas).toEqual(result)
  })

  it('stateの画像ファイルの情報を更新', () => {
    state.imageDatas = {
      sha1: {
        status: 'loaded',
        data: 'aaa'
      }
    }

    const payload = {
      sha: 'sha2',
      blobUri: 'blob'
    }

    const result = {
      sha1: {
        status: 'loaded',
        data: 'aaa'
      },
      sha2: {
        status: 'loaded',
        data: 'blob'
      }
    }

    mutations.setImageData(state, payload)
    expect(state.imageDatas).toEqual(result)
  })

  it('選択したフォルダー内のファイルのパスをstateに格納', () => {
    const filePaths = ['path1', 'path2', 'path3']
    mutations.setDisplayedFiles(state, filePaths)
    expect(state.displayedFiles).toBe(filePaths)
  })

  it('画像選択時にstateにchangedFilesのもととなるオブジェクトを作る', () => {
    state.changedFiles = {}
    const payload = {
      hoge: 'hoge',
      fuga: 'fuga'
    }

    mutations.setChangedFilesBase(state, payload)
    expect(state.changedFiles).toEqual(payload)
  })

  it('変更内容をstateに格納', () => {
    state.changedFiles = {
      'a.jpg': {},
      'b.jpg': {}
    }
    const payload = {
      subj: '2000',
      aho: 'aho'
    }

    const result = {
      'a.jpg': {
        subj: '2000',
        aho: 'aho'
      },
      'b.jpg': {
        subj: '2000',
        aho: 'aho'
      }
    }

    mutations.setChangedFiles(state, payload)
    expect(state.changedFiles).toEqual(result)
  })
})
