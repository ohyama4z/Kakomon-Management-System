import mutations from '../mutations'

const netlifyIdentity = require('netlify-identity-widget')

// netlifyIdentityの関数を使えるようにする
jest.mock('netlify-identity-widget')
netlifyIdentity.currentUser = jest.fn()

describe('mutations', () => {
  it('setBranches', () => {
    const data = 'asdf'
    const state = { metadata: { status: '', branches: '' } }
    mutations.setBranches(state, data)
    console.log('hoge', state, state.metadata.status)

    expect(state.metadata.status).toBe('loaded')
    expect(state.metadata.branches).toEqual('asdf')
  })

  it('getBranches', () => {
    const state = { metadatas: { status: '', data: '' } }
    const res = { a: 'b', c: 'd' }
    mutations.getBranches(state, res)
    expect(state.metadatas.status).toBe('loaded')
    expect(state.metadatas.data).toEqual({ a: 'b', c: 'd' })
  })

  it('setcsvobj', () => {
    const state = { setCsvObj: { status: '' }, files: { x: 'y' } }
    const csvObj = { x: 'y' }
    mutations.setCsvObj(state, csvObj)
    expect(state.setCsvObj.status).toBe('loaded')
    expect(state.files).toEqual({ x: 'y' })
  })

  // it('updateLastPage', () => {
  //   beforeEach(() => {
  //     localStorage.clear();
  //   });
  
  //   // const lastPageInStrage = 'test'
  //   // const lastPage = null
  //   // const state = 'hoge'
  //   const state = { lastPage: '' }

  //   mutations.updateLastPage(state)
  //   // console.log(':p~', mutations.updateLastPage)

  //   expect(state.lastPage).toEqual('upload')
  // })

  it('getcurrentUser', () => {
    const state ={ currentUser: jest.fn() }
    mutations.getCurrentUser(state)

    expect(netlifyIdentity.currentUser).toHaveBeenCalled()
    expect(state.currentUser).toBe(netlifyIdentity.currentUser())
  })

})
