import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex, { ActionTree } from 'vuex'
// @ts-ignore
import Vuikit from 'vuikit'
// @ts-ignore
import { Notification } from 'vuikit/lib/notification'
import App from '../App.vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Vuikit)

interface State {
  notifications: string[]
}

describe('App.vue', () => {
  let state: State
  let actions: ActionTree<Readonly<State>, unknown>
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
    const store = new Vuex.Store({
      state,
      actions
    })

    const wrapper = shallowMount(App, {
      store,
      localVue
    })

    state.notifications = ['aho']
    await flushPromises()
    const localNotificationsVal = wrapper.vm.$data.messages
    expect(localNotificationsVal).toEqual(['aho'])
  })

  it('ローカルに保存してる通知内容が変更(タイムアウト)されると、変更をstateに同期するactionsが呼ばれる', async () => {
    const store = new Vuex.Store({
      state,
      actions
    })

    const wrapper = shallowMount(App, {
      store,
      localVue
    })

    const notificationsWrapper = wrapper.findComponent(Notification)
    await new Promise(resolve => setTimeout(resolve, 5000))
    const wasTimeoutNotification = wrapper.findComponent(Notification)

    expect(wasTimeoutNotification.html()).toEqual(notificationsWrapper)
  })
})
