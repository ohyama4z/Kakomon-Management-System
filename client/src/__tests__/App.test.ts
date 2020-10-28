import { createLocalVue, shallowMount } from '@vue/test-utils'
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

  it('stateの通知が変更されると画面下に通知が表示される', () => {
    const stubs = {
      VkNotification: Notification
    }
    const store = new Vuex.Store({
      state: { notifications: ['あほ', 'あひ'] },
      actions
    })

    const wrapper = shallowMount(App, {
      store,
      localVue
      // stubs
    })

    const aho = wrapper.findComponent(Notification)
    // const manu = wrapper.findComponent(Notification)
    expect(wrapper.html()).toEqual('')
  })
})
