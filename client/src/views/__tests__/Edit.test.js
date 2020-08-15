import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import Edit from '../Edit'
import Vuex from 'vuex'
import actions from '../../store/actions'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Edit.vue', () => {
    it ('ページが読み込まれたときにbranchを取得するactionを走らせる', () => {
        const actions = {
            getMetadatas: jest.fn(),
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
        const wrapper = shallowMount(Edit, {
            localVue,
            store
        })
        expect(actions.getMetadatas).toHaveBeenCalled()
    })
})
