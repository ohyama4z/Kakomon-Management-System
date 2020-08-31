import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueRouter from 'vue-router'
import Root from '../Root'

const localVue = createLocalVue()

localVue.use(VueRouter)

describe('Root.vue', () => {
  let router
  beforeEach(() => {
    router = new VueRouter()
  })

  it('ハッシュ無しでページが読み込まれると/loginに遷移する', () => {
    const wrapper = shallowMount(Root, {
      localVue,
      router
    })

    expect(wrapper.vm.$route.path).toBe('/login')
  })
  it('ハッシュありでページが読み込まれるとハッシュ付きで/loginに遷移する', async () => {
    await router.push({ path: '/', hash: '#hoge' })
    const wrapper = shallowMount(Root, {
      localVue,
      router
    })

    await flushPromises()
    expect(wrapper.vm.$route.path).toBe('/login')
    expect(wrapper.vm.$route.hash).toBe('#hoge')
  })
})
