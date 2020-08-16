import { shallowMount, createLocalVue } from '@vue/test-utils'
import Edit from '../Edit'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Edit.vue', () => {
  it('ページが読み込まれたときにbranchを取得するactionを走らせる', () => {
    const actions = {
      getMetadatas: jest.fn(),
      getBranchData: jest.fn()
    }
    const store = new Vuex.Store({
      state: {
        files: [],
        currentUser: true,
        metadatas: {
          status: 'unrequested',
          data: []
        }
      },
      actions
    })
    shallowMount(Edit, {
      localVue,
      store
    })
    expect(actions.getMetadatas).toHaveBeenCalled()
  })
})
