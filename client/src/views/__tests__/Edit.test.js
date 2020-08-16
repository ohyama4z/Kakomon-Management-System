import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import Edit from '../Edit'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Edit.vue', () => {
  it('ページが読み込まれたときにbranchを取得するactionを走らせる', () => {
    const state = {
      files: [],
      currentUser: true,
      metadatas: {
        status: 'unrequested',
        data: []
      },
      setCsvObj: {
        status: 'unrequested',
        unparsedData: {}
      }
    }
    const actions = {
      getMetadatas: jest.fn(),
      getBranchData: jest.fn()
    }
    const store = new Vuex.Store({
      state,
      actions
    })
    shallowMount(Edit, {
      localVue,
      store
    })
    expect(actions.getMetadatas).toHaveBeenCalled()
  })
})
