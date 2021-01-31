import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Sidebar from '../Sidebar'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Sidebar.vue', () => {
  let state
  let getters
  let mutations
  let actions
  beforeEach(() => {
    state = {
      currentUser: {
        token: {
          access_token: 'token'
        }
      },
      lastPage: '',
      currentBranch: '',

      commits: {},
      contentMetadatas: {},

      branches: {
        status: 'unrequested',
        data: {}
      }
    }

    getters = {
      currentBranchMetadatas: jest.fn(() => ({
        data: {
          src1: {
            src: 'src1',
            subj: 'subj1',
            year: 'year1',
            content_type: 'content_type1',
            tool_type: 'tool_type1',
            period: 'period1',
            sha: 'sha1'
          },
          src2: {
            src: 'src2',
            subj: 'subj1',
            year: 'year1',
            content_type: 'content_type1',
            tool_type: 'tool_type1',
            period: 'period1',
            sha: 'sha2'
          },
          src3: {
            src: 'src3',
            subj: 'subj3',
            year: 'year3',
            content_type: 'content_type3',
            tool_type: 'tool_type3',
            period: 'period3',
            sha: 'sha3'
          }
        },
        status: 'loaded'
      }))
    }

    mutations = {
      setExpand: jest.fn(),
      setChangedFilesBase: jest.fn()
    }

    actions = {
      getImageDatas: jest.fn()
    }

    jest.clearAllMocks()
  })
  it('gettersから取得したファイル情報からvue-sidebar-menuに合う構造のオブジェクトを作る', () => {
    state.currentBranch = 'master'
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    const wrapper = shallowMount(Sidebar, {
      store,
      localVue
    })

    const icon = 'fa fa-folder'

    const result = [
      {
        header: true,
        title: `Branch : ${state.currentBranch}`,
        hiddenOnCollapse: true
      },
      {
        title: 'period1',
        icon,
        isLast: false,
        expand: false,
        child: [
          {
            title: 'subj1',
            icon,
            isLast: false,
            expand: false,
            child: [
              {
                title: 'tool_type1',
                icon,
                isLast: false,
                expand: false,

                child: [
                  {
                    title: 'year1',
                    icon: 'fas fa-circle',
                    isLast: true,
                    expand: false,
                    data: {
                      period: 'period1',
                      subj: 'subj1',
                      tool_type: 'tool_type1',
                      year: 'year1',
                      content_type: 'content_type1',
                      sha: 'sha2',
                      src: 'src2'
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        title: 'period3',
        icon,
        isLast: false,
        expand: false,
        child: [
          {
            title: 'subj3',
            icon,
            isLast: false,
            expand: false,
            child: [
              {
                title: 'tool_type3',
                icon,
                isLast: false,
                expand: false,
                child: [
                  {
                    title: 'year3',
                    icon: 'fas fa-circle',
                    isLast: true,
                    expand: false,
                    data: {
                      period: 'period3',
                      subj: 'subj3',
                      tool_type: 'tool_type3',
                      year: 'year3',
                      content_type: 'content_type3',
                      sha: 'sha3',
                      src: 'src3'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]

    expect(getters.currentBranchMetadatas).toHaveBeenCalled()
    expect(wrapper.vm.sidebarMenu).toEqual(result)
  })

  it('サイドバー全体を開閉した際に、state上にあるサイドバーの開閉の情報を更新する', () => {
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    const wrapper = shallowMount(Sidebar, {
      store,
      localVue
    })

    const collapse = true

    wrapper.vm.onToggleCollapse(collapse)
    expect(mutations.setExpand).toHaveBeenCalled()
  })

  it('ファイルツリーの末端ディレクトリ(年度)をクリックすると画像表示のactionsが呼ばれる', () => {
    state.currentBranch = 'master'
    const store = new Vuex.Store({
      state,
      getters,
      mutations,
      actions
    })
    const wrapper = shallowMount(Sidebar, {
      store,
      localVue
    })

    const item = {
      title: 'year1',
      icon: 'fa fa-circle',
      isLast: true,
      expand: false,
      data: {
        period: 'period1',
        subj: 'subj1',
        tool_type: 'tool_type1',
        year: 'year1',
        filename: ''
      }
    }
    const e = true

    wrapper.vm.onItemClick(e, item)
    expect(actions.getImageDatas).toHaveBeenCalled()

    const payload = {
      src1: {
        src: 'src1',
        subj: 'subj1',
        year: 'year1',
        content_type: 'content_type1',
        tool_type: 'tool_type1',
        period: 'period1',
        sha: 'sha1',
        image_index: '1'
      },
      src2: {
        src: 'src2',
        subj: 'subj1',
        year: 'year1',
        content_type: 'content_type1',
        tool_type: 'tool_type1',
        period: 'period1',
        sha: 'sha2',
        image_index: '2'
      }
    }
    expect(mutations.setChangedFilesBase).toHaveBeenCalledWith(state, payload)
  })
})
