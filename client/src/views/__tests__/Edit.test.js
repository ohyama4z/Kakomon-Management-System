import { mount } from '@vue/test-utils'
import Edit from '../Edit'
import Vuex from 'vuex'
// import Actions from ''

const wrapper = mount(Edit)

const vm = wrapper.vm

console.log(wrapper)