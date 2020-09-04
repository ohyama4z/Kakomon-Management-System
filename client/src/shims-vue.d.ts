import Vue from 'vue'
import * as Vuex from 'vuex'
import { store } from './main'
declare module '*.vue' {
  export default Vue
}

declare module 'vue/types/vue' {
  export default Vue
  interface Vue {
    $store: Vuex.store<typeof store>
    $state: State
  }
}
