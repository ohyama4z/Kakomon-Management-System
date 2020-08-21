import { config } from '@vue/test-utils'
import 'jest-localstorage-mock'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import Vuikit from 'vuikit'
require('jest-fetch-mock').enableMocks()

Vue.use(Vuikit)
Vue.config.silent = true
config.stubs['vk-spinner'] = {
  template: '<span class="vk-spinner-stub" />'
}
config.stubs['vk-button'] = {
  template: '<button class="vk-button-stub"></button>'
}
