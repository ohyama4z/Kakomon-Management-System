import { mount, shallowMount, createLocalVue } from '@vue/test-utils'
import Edit from '../Edit'
import Vuex from 'vuex'
import Actions from '../../store/actions'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Actions.vue', () => {})

const wrapper = mount(Edit)

const vm = wrapper.vm

console.log(wrapper)