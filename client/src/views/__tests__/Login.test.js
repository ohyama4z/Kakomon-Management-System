import { shallowMount, createLocalVue } from '@vue/test-utils'
import Login from '../Login'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
// import Mctions from '../../store/mutations'


const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(VueRouter)

const router = new VueRouter()

describe('Login.vue', () => {
    it('currentUserがログイン済みのとき最後に開いたパスに飛ばすmutationが呼ばれる', () => {
        const mutations = {
            getCurrentUser: jest.fn(),
            updateLastPage: jest.fn()
        }
        const store = new Vuex.Store({
            state: {
                currentUser: true
            },
            mutations
        })
        const wrapper = shallowMount(Login, {
            localVue,
            router,
            store
        })
        expect(mutations.updateLastPage).toHaveBeenCalled()
    })
})

