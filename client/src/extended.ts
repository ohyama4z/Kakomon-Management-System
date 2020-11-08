import { Vue, VueConstructor } from 'vue/types/vue'
import { store } from './main'
import { Actions } from './store/actions'
import { Mutations } from './store/mutations'
import { State as ExtendedState } from './store/state'

type VuexStore = typeof store
interface Store extends VuexStore {
  dispatch<K extends keyof Actions>(
    key: K,
    payload?: Actions[K] extends (...args: any[]) => any
      ? Parameters<Actions[K]>[1]
      : unknown
  ): Actions[K] extends (...args: any[]) => Promise<any>
    ? ReturnType<Actions[K]>
    : Promise<unknown>

  commit<K extends keyof Mutations>(
    key: K,
    payload?: Parameters<Mutations[K]>[1]
  ): ReturnType<Mutations[K]>

  state: ExtendedState
}

interface StateTypedVue extends Vue {
  readonly $store: Store
  readonly $state: ExtendedState
}

export type StateTypedVueConstructor<
  V extends StateTypedVue = StateTypedVue
> = VueConstructor<V>
