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
    it('currentUserがログイン済みのとき最後に開いたパスに飛ばすmutationが呼ばれ、lastPageに遷移する', () => {
        const mutations = {
            getCurrentUser: jest.fn(),
            updateLastPage: jest.fn()
        }
        const store = new Vuex.Store({
            state: {
                currentUser: true,
                lastPage: 'edit'
            },
            mutations
        })
        const wrapper = shallowMount(Login, {
            localVue,
            router,
            store
        })
        expect(mutations.updateLastPage).toHaveBeenCalled()
        expect(wrapper.vm.$route.path).toBe(`/${store.state.lastPage}`)
    })
})

// todo
// ログイン済みじゃないときのも追加しろ

