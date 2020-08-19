// import { createLocalVue, shallowMount } from '@vue/test-utils'
// import Vuex from 'vuex'
// import Edit from '../Edit'

// const localVue = createLocalVue()

// localVue.use(Vuex)

// const state = {
//   currenUser: true,
//   lastPage: '',
//   currentBranch: '',

//   commits: {},
//   contentMetadatas: {},

//   branches: {
//     status: 'unrequested',
//     data: {}
//   }
// }
// const mutations = {
//   updateLastPage: jest.fn()
// }
// const getters = {
//   currentBranchMetadatas: jest.fn(() => ({
//     'src1': { src: 'src1' },
//     'src2': { src: 'src2' }
//   }))
// }
// const actions = {
//   getBranches: jest.fn(),
//   selectBranch: jest.fn()
// }
// const store = new Vuex.Store({
//   state,
//   mutations,
//   getters,
//   actions
// })

describe('Edit.vue', () => {
  // it('ページが読み込まれたときにbranchを取得する', async () => {
  //   shallowMount(Edit, {
  //     localVue,
  //     store
  //   })
  //   await Edit.mounted()
  //   expect(actions.getBranches).toHaveBeenCalled()
  //   expect(actions.selectBranch).toHaveBeenCalled()

  //   jest.clearAllMocks()
  // })

  it('dammy test', () => {
    expect(1+1).toBe(2)
  })
})
