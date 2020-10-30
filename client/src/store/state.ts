type Status = 'unrequested' | 'loading' | 'loaded' | 'invalied_status'

interface CurrentUser {
  token: {
    // eslint-disable-next-line camelcase
    access_token: string
  }
  email: string
}
interface Commits {
  [commitSha: string]: {
    data: { [csvName: string]: string }
    status: Status
  }
}

const headers = [
  'src',
  'subj',
  'tool_type',
  'period',
  'year',
  'content_type',
  'author',
  'image_index',
  'included_pages_num',
  'fix_text'
] as const
type Headers = typeof headers[number]
interface ContentMetadatas {
  [key: string]: {
    data: {
      [imageName: string]: {
        [key in Headers]: string
      }
    }
    status: Status
  }
}
const chagedFilesHeaders = [...headers, 'sha', 'csvFile']
type ChagedFilesHeaders = typeof chagedFilesHeaders[number]
interface ChangedFiles {
  [filename: string]: {
    [key in ChagedFilesHeaders]: string
  }
}
interface Branches {
  data: {
    [key: string]: string
    master: string
  }
  status: Status
}
interface ImageDatas {
  [imageSha: string]: {
    data: string
    status: Status
  }
}
interface ImageShas {
  [commitSha: string]: {
    [directoryPath: string]: {
      data: {
        [filename: string]: {
          sha: string
          url: string
        }
      }
      status: Status
    }
  }
}

export interface State {
  currentUser: CurrentUser | null
  lastPage: string
  currentBranch: string
  expand: boolean
  commits: Commits
  contentMetadatas: ContentMetadatas
  changedFiles: ChangedFiles
  branches: Branches
  imageDatas: ImageDatas
  imageShas: ImageShas
  displayedFiles: string[]
  selectedFiles: string[]
  commitStatus: Status
}

const state: State = {
  currentUser: null,
  lastPage: '',
  currentBranch: '',
  expand: true,

  commits: {},
  contentMetadatas: {},

  changedFiles: {},
  branches: {
    status: 'unrequested',
    data: {
      master: ''
    }
  },

  imageDatas: {},
  imageShas: {},
  displayedFiles: [],
  selectedFiles: [],
  commitStatus: 'unrequested'
}
export default state
