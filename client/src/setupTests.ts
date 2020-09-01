import jestFetchMock from 'jest-fetch-mock'
import 'jest-localstorage-mock'
import 'regenerator-runtime/runtime'
import Vue from 'vue'
import Vuikit from 'vuikit'
jestFetchMock.enableMocks()

Vue.use(Vuikit)
