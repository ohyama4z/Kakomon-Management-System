import PromisePool from 'native-promise-pool'
const netlifyIdentity = require('netlify-identity-widget')
const moment = require('moment')

export default {
  upload: async ({ commit }, newFile) => {
    commit('upload', newFile)
  },

  getMetadatas: async ({ commit, state }) => {
    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const httpRes = await fetch(
      'http://localhost:8085/.netlify/git/github/branches',
      { method, headers }
    )
    const res = await httpRes.json()

    commit('getBranches', res)
  },

  getBranchData: async ({ commit, state }, branchName) => {
    // commit('setStatusLoading', state.setCsvObj)
    commit('setStatus', 'csvObj', 'loading')

    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }

    console.log('choosebranchname', branchName)
    const httpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${branchName}`,
      { method, headers }
    )

    // const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas/unassorted.csv?ref=${branchName}`, {method, headers})
    const resArr = await httpRes.json()
    console.log('^_^', resArr)

    const pool = new PromisePool(50) // 50 tasks at once

    // localStorage.removeItem(`${branchName}_lastItem`)

    resArr.forEach(res => {
      pool.open(async () => {
        const previousResStr = localStorage.getItem(`${branchName}_${res.name}`)
        const previousRes = JSON.parse(previousResStr)
        // const previousRes = state[`${branchName}`][`${res.name}`]

        if (previousRes == null || res.sha !== previousRes.sha) {
          console.log('manukemanuke')
          const httpResponse = await fetch(
            `http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${branchName}`,
            { method, headers }
          )

          const response = await httpResponse.json()
          const strRes = JSON.stringify(response)
          localStorage.setItem(`${branchName}_${res.name}`, strRes)
          commit('saveBase64EncodedCsv', {
            branchData: response,
            branchName,
            fileName: res.name
          })
        }

        const curResStr = localStorage.getItem(`${branchName}_${res.name}`)
        const curRes = JSON.parse(curResStr)
        // const curRes = state[`${branchName}`][`${res.name}`]
        console.log('^^;', curRes)
        const buffer = Buffer.from(curRes.content, 'base64')
        const csvData = buffer.toString('utf8')
        // console.log(csvData)
        const resultObj = convertCsvToObjArray(csvData)
        // console.log(resultObj)
        console.log('hoge', resultObj)

        // csvObj = Object.assign(csvObj, resultObj)
      })
    })

    const files = await Promise.all(
      resArr.map(res =>
        pool.open(async () => {
          const previousRes =
            state.setCsvObj.unparsedData[`${branchName}`]?.[`${res.name}`]
          // state.setCsvObj.unparsedData[`${branchName}`]?.[`${res.name}`]の
          // ?. の部分がわからないときはOptional Chaningでググれ

          if (previousRes == null || res.sha !== previousRes.sha) {
            const unparsed = localStorage.getItem(`${res.sha}`)
            const branchDataInStorage = JSON.parse(unparsed)

            if (branchDataInStorage == null) {
              const httpResponse = await fetch(
                `http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${branchName}`,
                { method, headers }
              )
              const response = await httpResponse.json()
              commit('saveBase64EncodedCsv', {
                branchData: response,
                branchName,
                fileName: res.name
              })
              localStorage.setItem(`${res.sha}`, JSON.stringify(response))
            } else if (res.sha === branchDataInStorage.sha) {
              console.log('using localStorage cache')
              commit('saveBase64EncodedCsv', {
                branchData: branchDataInStorage,
                branchName,
                fileName: res.name
              })
            }
          } else {
            console.log('using state cache')
          }

          const curRes =
            state.setCsvObj.unparsedData[`${branchName}`][`${res.name}`]
          const csvData = Buffer.from(curRes.content, 'base64').toString('utf8')
          // console.log(csvData)
          const resultObj = convertCsvToObjArray(csvData)
          // console.log(resultObj)

          return resultObj
        })
      )
    )

    const filesBySrc = files.reduce((p, v) => {
      return {
        ...p,
        ...v
      }
    }, {})

    // console.log(':( (2)', JSON.stringify({ files }, null, 2))

    // localStorage.setItem(`${branchName}_lastItem`, 'set')

    const editcsvobj = {
      changedFiles: {
        'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg': {
          src: 'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg',
          subj: '倫理社会',
          tool_type: 'テスト',
          period: '前期定期',
          year: '2018',
          content_type: '',
          author: '',
          image_index: '',
          included_pages_num: '',
          fix_text: ''
        },
        'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg': {
          src: 'scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg',
          subj: '',
          tool_type: '',
          period: '',
          year: '',
          content_type: '',
          author: '',
          image_index: '',
          included_pages_num: '',
          fix_text: ''
        }
      }
    }

    // editedobject→csv
    console.log(Object.values(editcsvobj.changedFiles))
    const objarray = Object.values(editcsvobj.changedFiles)
    // console.log(convertToCSV(objarray))
    const content = convertToCSV(objarray)

    // //   // 追々やる
    // //   // branchName = sendObj.selectedBranch 同じ名前のselectedbranchが大量にある可能性
    // //   // selectedfilesが共通のもののそれぞれをつなぎ合わせてcontentsにしてbase64encodeするor utf-8のまま

    // commitCSV: async ({ state }, sendObj) => {
    // const token = state.currentUser.token.access_token
    const getmethod = 'GET'
    const postmethod = 'POST'
    const patchmethod = 'PATCH'
    // const headers = {
    //   Authorization: `Bearer ${token}`
    // }

    //   console.log('refarr', resArr[0].sha) //filehash

    // refの取得
    const branchref = await fetch(
      `http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`,
      { getmethod, headers }
    )
    const parseref = await branchref.json()
    console.log('branch毎のハッシュ', `${branchName}`, parseref.object.sha)

    // commitの取得
    const commithttpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/commits/${parseref.object.sha}`,
      { getmethod, headers }
    )
    const commitres = await commithttpRes.json()
    console.log(':p~', commitres)
    // console.log(':p~', commitres, sendObj)

    const postcontents = {
      // content: 'dGVzdCBjb21taXQ=',
      // encoding: 'base64'
      content,
      encoding: 'utf-8'
    }
    const bodys = JSON.stringify(postcontents)

    // blobの作成
    const refhttpRes = await fetch(
      `http://localhost:8085/.netlify/git/github/git/blobs?ref=${branchName}`,
      { method: postmethod, headers, body: bodys }
    ) // { headerss: {'Content-Type': 'application/json'}}
    const refres = await refhttpRes.json()
    console.log(':q~', refres)

    // const masmaster = await fetch('http://localhost:8085/.netlify/git/github/branches/master', {method: getmethod, headers})
    // const masres = await masmaster.json()

    // console.log(commitres.sha, masres.commit.sha) 同じ値
    const treesbody = {
      // base_tree: commitres.sha,
      base_tree: commitres.commit.tree.sha,
      tree: [
        {
          path: 'test.csv',
          mode: '100644', // 100644  100755 , 040000 160000  シンボリックリンクのパス120000
          type: 'blob',
          sha: refres.sha
        }
      ]
    }

    // treeの作成
    const treesbodys = JSON.stringify(treesbody)
    const branchhttpRes = await fetch(
      'http://localhost:8085/.netlify/git/github/git/trees',
      { method: postmethod, headers, body: treesbodys }
    )
    const branchres = await branchhttpRes.json()
    console.log('branchesres', branchres)
    console.log('check', refres.sha, branchres.sha, parseref.object.sha)
    const date = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    console.log('time', date)

    const commitsbody = {
      message: date,
      author: {
        name: 'test',
        email: 'hoge@gmail.com',
        date
      },
      parents: [
        // refres.sha
        parseref.object.sha
      ],
      tree: branchres.sha
    }
    const commitsbodys = JSON.stringify(commitsbody)
    console.log(commitsbodys)

    // commitの作成
    const createcommithttpres = await fetch(
      `http://localhost:8085/.netlify/git/github/git/commits?ref=${branchName}`,
      { method: postmethod, headers, body: commitsbodys }
    )
    const createcommitres = await createcommithttpres.json()
    console.log('commithash', createcommitres.sha)

    // refの更新
    const updatebody = {
      sha: createcommitres.sha,
      force: false // 強制pushするか否
    }
    const updatebodys = JSON.stringify(updatebody)
    const updaterefhttpres = await fetch(
      `http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`,
      { method: patchmethod, headers, body: updatebodys }
    )
    // console.log(updatebodys)
    const updaterefres = await updaterefhttpres.json()
    console.log('asdf', updaterefres)
    // console.log(':(', csvObj)
    // commit('setCsvObj', csvObj)

    commit('setCsvObj', filesBySrc)
  },

  updateCurrentUser: async ({ commit }) => {
    const user = netlifyIdentity.currentUser()
    if (user != null && user.token.access_token == null) {
      await netlifyIdentity.refresh()
    }
    commit('updateCurrentUser', user)
  }

  // editCSV: async ( {state}, branchname, editFile ) => {
  //   const token = state.currentUser.token.access_token
  //   const httpRes = await fetch(`http://localhost:8085/.netlify/git//github/git/trees/${branchname}/:metadatas`, {method, headers, body}) //refs/heads/master
  // }
}

// blobs //github/git/blobs post    content:ファイルの文字列(base64エンコードしたものとか) encoding:base64(utf-8という選択もある) request payload
// master //github/branches/master  get
// trees //github/git/trees post    base_tree(masterから返ってくるcommithash commit.sha) tree(配列) {path: ,mode: , sha: blobs叩いた時に返ってくるsha, type: "blob"}
// commit //github/git/commits    author:{name: , email: , date: } parents: [master叩いた時に返ってくるcommit.sha] tree: [trees叩いた時に返ってくるsha]
// master // github/git/refs/heads/master

const convertToCSV = arr => {
  const array = [Object.keys(arr[0])].concat(arr)
  return array
    .map(it => {
      return Object.values(it).toString()
    })
    .join('\n')
}

// const convertCsvToObjArray = (csv) => {
//     //header:CSV1行目の項目 :csvRows:項目に対する値
//     const [header, ...csvRows] = csv.split('\n').filter((row) => {
//       if (row !== '') {
//         return row;
//       }
//     }).map((row) => {
//       return row.split(',');
//     });

//     let arrayInKeyAndValue;
//     let resultArray;
//     let tmpResultArray;

//     tmpResultArray = csvRows.map((r) => {
//       arrayInKeyAndValue = header.map((_, index) => {
//         //ヘッダーの空白文字を削除。keyとvalueに値をセット
//         return ({ key: header[index].replace(/\s+/g, ''), value: r[index] });
//       });
//       arrayInKeyAndValue = arrayInKeyAndValue.reduce((previous, current) => {
//         //{key: "物", value: "MacBook", メーカー: "apple", 値段: "3000"}を作成
//         previous[current.key] = current.value;
//         return previous;
//       }, {});
//       return arrayInKeyAndValue;
//     });

//     resultArray = tmpResultArray.reduce((previous, current) => {
//       previous[current.src] = current;
//       return previous;
//     }, {});
//     return resultArray;
//   }
export const convertCsvToObjArray = csv => {
  // header:CSV1行目の項目 :csvRows:項目に対する値
  const [headerNames, ...csvRows] = csv
    .split('\n')
    .filter(row => row !== '')
    .map(row => {
      return row.split(',')
    })

  return csvRows
    .map(r => {
      return headerNames
        .map((headerName, index) => {
          // ヘッダーの空白文字を削除。keyとvalueに値をセット
          return { key: headerName.replace(/\s+/g, ''), value: r[index] }
        })
        .reduce((previous, current) => {
          // {key: "物", value: "MacBook", メーカー: "apple", 値段: "3000"}を作成
          previous[current.key] = current.value
          return previous
        }, {})
    })
    .reduce((previous, current) => {
      previous[current.src] = current
      return previous
    }, {})
}
// const asyncLocalStorage = {
//   setItem: async function (key, value) {
//       await null;
//       return localStorage.setItem(key, value);
//   },
//   getItem: async function (key) {
//       await null;
//       return localStorage.getItem(key);
//   }
// };
