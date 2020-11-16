import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex, { ActionTree } from 'vuex'
// @ts-ignore
import Vuikit from 'vuikit'
import App from '../App.vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuikit)

interface State {
  notifications: string[]
}

describe('App.vue', () => {
  let state: State
  let actions: ActionTree<Readonly<State>, unknown> & {
    syncNotificationsChange: jest.Mock<any, any>
  }
  beforeEach(() => {
    state = {
      notifications: []
    }

    actions = {
      syncNotificationsChange: jest.fn()
    }

    jest.clearAllMocks()
  })

  it('stateに格納されている通知内容が変更されるとローカルにその値を渡す', async () => {
    const stubs = {
      routerView: { template: '<div></div>' }
    }
    const store = new Vuex.Store({
      state,
      actions
    })

    const wrapper = shallowMount(App, {
      store,
      localVue,
      stubs
    })

    state.notifications = ['aho']
    await flushPromises()
    const localNotificationsVal = wrapper.vm.$data.messages
    expect(localNotificationsVal).toEqual(['aho'])
  })

  it('ローカルに保存してる通知内容が変更されると、変更をstateに同期するactionsが呼ばれる', async () => {
    const stubs = {
      routerView: { template: '<div></div>' }
    }

    const store = new Vuex.Store({
      state,
      actions
    })

    const wrapper = shallowMount(App, {
      store,
      localVue,
      stubs
    })

    state.notifications = ['aho', 'hoa']
    await flushPromises()
    expect(wrapper.vm.$data.messages).toEqual(['aho', 'hoa'])

    wrapper.vm.$data.messages = ['aho']

    await flushPromises()
    expect(actions.syncNotificationsChange.mock.calls[1][1]).toEqual(['aho'])
  })
})
