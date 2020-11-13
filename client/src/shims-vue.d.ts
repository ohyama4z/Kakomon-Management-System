import Vue from 'vue'
import * as Vuex from 'vuex'
import { store } from './main'
import { Actions } from './store/actions'
import { Mutations } from './store/mutations'
declare module '*.vue' {
  export default Vue
}

interface Store extends Vuex.store<typeof store> {
  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Actions[K] extends (...args: any[]) => any
      ? Parameters<Actions[K]>[1]
      : any
  ): Actions[K] extends (...args: any[]) => any
    ? ReturnType<Actions[K]>
    : unknown

  commit<K extends keyof Mutations>(
    key: K,
    payload: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>
}

declare module 'vue/types/vue' {
  export default Vue
  interface Vue {
    $store: Store
    $state: State
  }
}
