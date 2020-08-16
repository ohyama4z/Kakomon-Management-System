import { convertCsvToObjArray } from '../actions'

describe('action.js', () => {
  it('csvをオブジェクトにする関数が機能するか見る', () => {
    const csv = `src,name,birthday\n` + `aho,TARO,0616\n` + `\n` + `a,b,c\n`
    const result = {
      aho: {
        src: 'aho',
        name: 'TARO',
        birthday: '0616'
      },
      a: {
        src: 'a',
        name: 'b',
        birthday: 'c'
      }
    }
    expect(convertCsvToObjArray(csv)).toEqual(result)
  })
})
