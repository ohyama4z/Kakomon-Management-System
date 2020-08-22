import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Sidebar from '../Sidebar'

const localVue = createLocalVue()

localVue.use(Vuex)

const state = {
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

const getters = {
  currentBranchMetadatas: jest.fn(() => ({
    src1: {
      src: 'src1',
      subj: 'subj1',
      year: 'year1',
      content_type: 'content_type1',
      tool_type: 'tool_type1',
      period: 'period1'
    },
    src2: {
      src: 'src2',
      subj: 'subj1',
      year: 'year1',
      content_type: 'content_type1',
      tool_type: 'tool_type1',
      period: 'period1'
    },
    src3: {
      src: 'src3',
      subj: 'subj3',
      year: 'year3',
      content_type: 'content_type3',
      tool_type: 'tool_type3',
      period: 'period3'
    }
  }))
}

const mutations = {
  setCollapased: jest.fn()
}

const store = new Vuex.Store({
  state,
  getters,
  mutations
})

describe('Edit.vue', () => {
  it('gettersから取得したファイル情報からvue-sidebar-menuに合う構造のオブジェクトを作る', () => {
    state.currentBranch = 'master'
    const wrapper = shallowMount(Sidebar, {
      store,
      localVue
    })

    const icon = 'fa fa-folder'

    const result = [
      {
        header: true,
        title: `Branch : ${state.currentBranch}`,
        icon: '',
        hiddenOnCollapse: true
      },
      {
        title: 'period1',
        icon,
        child: [
          {
            title: 'subj1',
            icon,
            child: [
              {
                title: 'tool_type1',
                icon,
                child: [
                  {
                    title: 'year1',
                    icon,
                    child: [
                      {
                        title: 'content_type1',
                        icon,
                        child: [
                          {
                            title: 'src1',
                            icon: 'fas fa-file',
                            data: {
                              src: 'src1',
                              subj: 'subj1',
                              year: 'year1',
                              content_type: 'content_type1',
                              tool_type: 'tool_type1',
                              period: 'period1'
                            }
                          },
                          {
                            title: 'src2',
                            icon: 'fas fa-file',
                            data: {
                              src: 'src2',
                              subj: 'subj1',
                              year: 'year1',
                              content_type: 'content_type1',
                              tool_type: 'tool_type1',
                              period: 'period1'
                            }
                          }
                        ]
                      }
                    ]
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
        child: [
          {
            title: 'subj3',
            icon,
            child: [
              {
                title: 'tool_type3',
                icon,
                child: [
                  {
                    title: 'year3',
                    icon,
                    child: [
                      {
                        title: 'content_type3',
                        icon,
                        child: [
                          {
                            title: 'src3',
                            icon: 'fas fa-file',
                            data: {
                              src: 'src3',
                              subj: 'subj3',
                              year: 'year3',
                              content_type: 'content_type3',
                              tool_type: 'tool_type3',
                              period: 'period3'
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        props: {
          collapse: {
            default: true
          }
        }
      }
    ]

    expect(getters.currentBranchMetadatas).toHaveBeenCalled()
    expect(wrapper.vm.sidebarMenu).toEqual(result)

    jest.clearAllMocks()
  })

  it('サイドバー全体を開閉した際に、state上にあるサイドバーの開閉の情報を更新する', () => {
    const wrapper = shallowMount(Sidebar, {
      store,
      localVue
    })

    const collapse = true

    wrapper.vm.onToggleCollapse(collapse)
    expect(mutations.setCollapased).toHaveBeenCalled()

    jest.clearAllMocks()
  })
})
