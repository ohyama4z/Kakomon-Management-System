import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'
import Vuikit from 'vuikit'
import { IconButton } from 'vuikit/lib/icon'
import { Spinner } from 'vuikit/lib/spinner'
import Preview from '../Preview'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuikit)

describe('Preview.vue', () => {
  let state
  let mutations
  beforeEach(() => {
    state = {
      currentUser: {
        token: {
          access_token: 'token'
        }
      },
      currentBranch: '',
      commits: {},
      contentMetadatas: {},
      branches: {
        status: 'unrequested',
        data: {}
      },
      imageDatas: {},
      imageShas: {},
      displayedFiles: [],
      selectedFiles: []
    }

    mutations = {
      setSelectedFiles: jest.fn()
    }
    jest.clearAllMocks()
  })

  it('stateから選択されたフォルダの画像ファイル一覧を取得する', () => {
    state.currentBranch = 'master'
    state.branches = {
      data: { master: 'commitSha' }
    }
    state.displayedFiles = ['dir/path1.jpg', 'dir/path2.pdf']
    state.imageShas = {
      commitSha: {
        dir: {
          data: {
            'path1.jpg': { sha: 'sha1' },
            'path2.pdf': { sha: 'sha2' }
          }
        }
      }
    }
    state.imageDatas = {
      sha1: {
        data: {
          blobUri: 'blob1',
          downloadUrl: 'dlUrl1',
          pdfUrl: 'pdfUrl1'
        }
      },
      sha2: {
        data: {
          blobUri: 'blob2',
          downloadUrl: 'dlUrl2',
          pdfUrl: 'pdfUrl2'
        }
      }
    }
    const store = new Vuex.Store({
      state
    })

    const wrapper = shallowMount(Preview, {
      store,
      localVue
    })

    const result = [
      {
        blob: 'blob1',
        downloadUrl: 'dlUrl1',
        pdfUrl: 'pdfUrl1',
        fileType: 'jpg',
        filePath: 'dir/path1.jpg',
        filename: 'path1.jpg'
      },
      {
        blob: 'blob2',
        downloadUrl: 'dlUrl2',
        pdfUrl: 'pdfUrl2',
        fileType: 'pdf',
        filePath: 'dir/path2.pdf',
        filename: 'path2.pdf'
      }
    ]

    expect(wrapper.vm.images).toEqual(result)
  })

  it('画像を選択するとselectedFilesが更新(追加)され、枠線が青く表示される', async () => {
    state.currentBranch = 'master'
    state.branches = {
      data: { master: 'commitSha' }
    }
    state.displayedFiles = ['dir/path1.jpg', 'dir/path2.jpg']
    state.imageShas = {
      commitSha: {
        dir: {
          data: {
            'path1.jpg': { sha: 'sha1' },
            'path2.jpg': { sha: 'sha2' }
          }
        }
      }
    }
    state.imageDatas = {
      sha1: {
        data: {
          blobUri: 'blob1',
          downloadUrl: 'dlUrl1',
          pdfUrl: 'pdfUrl1'
        }
      },
      sha2: {
        data: {
          blobUri: 'blob2',
          downloadUrl: 'dlUrl2',
          pdfUrl: 'pdfUrl2'
        }
      }
    }
    state.selectedFiles = ['dir/path2.jpg']
    const stubs = {
      VkIconButton: IconButton,
      VkSpinner: Spinner
    }
    const store = new Vuex.Store({
      state,
      mutations
    })

    const wrapper = shallowMount(Preview, {
      store,
      localVue,
      stubs
    })

    const iconButton = wrapper.findAllComponents(IconButton).at(0)
    iconButton.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(mutations.setSelectedFiles).toHaveBeenCalled()
    state.selectedFiles = ['dir/path1.jpg', 'dir/path2.jpg']
    await flushPromises()
    const selectedImages = wrapper.findAll('img[class="selectedImage"]')
    expect(selectedImages.length).toBe(2)
  })

  it('すでに選択済みの画像を選択するとselectedFilesが更新(削除)され、枠線が灰色に戻る', async () => {
    state.currentBranch = 'master'
    state.branches = {
      data: { master: 'commitSha' }
    }
    state.displayedFiles = ['dir/path1.jpg', 'dir/path2.jpg']
    state.imageShas = {
      commitSha: {
        dir: {
          data: {
            'path1.jpg': { sha: 'sha1' },
            'path2.jpg': { sha: 'sha2' }
          }
        }
      }
    }
    state.imageDatas = {
      sha1: {
        data: {
          blobUri: 'blob1',
          downloadUrl: 'dlUrl1',
          pdfUrl: 'pdfUrl1'
        }
      },
      sha2: {
        data: {
          blobUri: 'blob2',
          downloadUrl: 'dlUrl2',
          pdfUrl: 'pdfUrl2'
        }
      }
    }
    state.selectedFiles = ['dir/path1.jpg', 'dir/path2.jpg']
    const stubs = {
      VkIconButton: IconButton,
      VkSpinner: Spinner
    }
    const store = new Vuex.Store({
      state,
      mutations
    })

    const wrapper = shallowMount(Preview, {
      store,
      localVue,
      stubs
    })

    const iconButton = wrapper.findAllComponents(IconButton).at(0)
    const selectedImages = wrapper.findAll('img[class="selectedImage"]')
    expect(selectedImages.length).toBe(2)
    iconButton.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 5))
    expect(mutations.setSelectedFiles).toHaveBeenCalled()
    state.selectedFiles = ['dir/path2.jpg']
    await flushPromises()
    const unselectedImages = wrapper.findAll('img[class="image"]')
    expect(unselectedImages.length).toBe(1)
  })
})
