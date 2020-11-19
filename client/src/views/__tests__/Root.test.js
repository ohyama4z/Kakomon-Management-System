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

  it('ハッシュ無しでページが読み込まれると/editに遷移する', async () => {
    await router.push({ path: '/' })
    const wrapper = shallowMount(Root, {
      localVue,
      router
    })

    await flushPromises()
    expect(wrapper.vm.$route.path).toBe('/edit')
    expect(wrapper.vm.$route.hash).toEqual('')
  })
  it('ハッシュありでページが読み込まれるとハッシュ付きで/editに遷移する', async () => {
    await router.push({ path: '/', hash: '#hoge' })
    const wrapper = shallowMount(Root, {
      localVue,
      router
    })

    await flushPromises()
    expect(wrapper.vm.$route.path).toBe('/edit')
    expect(wrapper.vm.$route.hash).toBe('#hoge')
  })
})
