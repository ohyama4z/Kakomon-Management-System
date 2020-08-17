import PromisePool from 'native-promise-pool'
import netlifyIdentity from 'netlify-identity-widget'
// const moment = require('moment')

export default {
  upload: async ({ commit }, newFile) => {
    commit('upload',newFile)

    console.log('action: upload')
  },

  get: async ({commit, state}) => {
    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const httpRes = await fetch('http://localhost:8085/.netlify/git/github/branches', {method, headers})
    const res = await httpRes.json()
    console.log('ahoahoa', httpRes, res)

    commit('getBranches', res)
  },

  getMetadatas: async ({commit, state}) => {
    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    const httpRes = await fetch('http://localhost:8085/.netlify/git/github/branches', {method, headers})
    const res = await httpRes.json()

    commit('getBranches', res)
  },

  getBranchData: async ({ commit, state }, branchName) => { // 引数にsendObj追加 todo
    // commit('setStatusLoading', state.setCsvObj)

    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    console.log("choosebranchname", branchName)
    const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${branchName}`, {method, headers})
    // const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas/unassorted.csv?ref=${branchName}`, {method, headers})
    const resArr = await httpRes.json()
    console.log('^_^',resArr)

    let csvObj = {}
    const pool = new PromisePool(50) // 50 tasks at once

    // localStorage.removeItem(`${branchName}_lastItem`)

    resArr.forEach(res => {
      pool.open(async () => {
        const previousResStr = localStorage.getItem(`${branchName}_${res.name}`)
        const previousRes = JSON.parse(previousResStr)
        // const previousRes = state[`${branchName}`][`${res.name}`]
        
        if (previousRes == null || res.sha !== previousRes.sha) {
          console.log('manukemanuke')
          const httpResponse = await fetch(`http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${branchName}`, {method, headers})
          const response = await httpResponse.json()
          const strRes = JSON.stringify(response)
          localStorage.setItem(`${branchName}_${res.name}`,strRes)
          commit('branchDataOnGithub' ,{
            branchData: response,
            branchName,
            fileName: res.name
          })
        }

        const curResStr = localStorage.getItem(`${branchName}_${res.name}`)
        const curRes = JSON.parse(curResStr)
        // const curRes = state[`${branchName}`][`${res.name}`]
        console.log('^^;', curRes)
        const buffer = new Buffer(curRes.content, 'base64')
        const csvData = buffer.toString('utf8')
        // console.log(csvData)
        const resultObj = convertCsvToObjArray(csvData);
        // console.log(resultObj)
        // console.log("hoge",resultObj)

        csvObj = Object.assign(csvObj, resultObj)
      })
    })
    // localStorage.setItem(`${branchName}_lastItem`, 'set')

  //   const editcsvobj = {
  //     changedFiles: {
  //       "scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg": {
  //         "src":"scanned/20180802_2年3紐。5組『倫理社会」前期定期試験1.jpg",
  //         "subj":"倫理社会",
  //         "tool_type":"テスト",
  //         "period":"前期定期",
  //         "year":"2018",
  //         "content_type":"",
  //         "author":"",
  //         "image_index":"",
  //         "included_pages_num":"",
  //         "fix_text":""
  //       },
  //       "scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg": {
  //         "src":"scanned/20180802_2年3紐。5組『倫理社会」前期定期試験2.jpg",
  //         "subj":"",
  //         "tool_type":"",
  //         "period":"",
  //         "year":"",
  //         "content_type":"",
  //         "author":"",
  //         "image_index":"",
  //         "included_pages_num":"",
  //         "fix_text":""
  //       },
  //     }
  //   }

  //   // editedobject→csv
  //   console.log(Object.values(editcsvobj.changedFiles))
  //   const objarray = Object.values(editcsvobj.changedFiles)
  //   // console.log(convertToCSV(objarray))
  //   const content = convertToCSV(objarray)

  // //   // 追々やる
  // //   // branchName = sendObj.selectedBranch 同じ名前のselectedbranchが大量にある可能性
  // //   // selectedfilesが共通のもののそれぞれをつなぎ合わせてcontentsにしてbase64encodeするor utf-8のまま

  // // commitCSV: async ({ state }, sendObj) => {
  //   // const token = state.currentUser.token.access_token
  //   const getmethod = 'GET'
  //   // const postmethod = 'POST'
  //   // const patchmethod = 'POST'
  //   // const headers = {
  //   //   Authorization: `Bearer ${token}`
  //   // }
    
  //   console.log('refarr', resArr[0].sha) //filehash
    
  //   // refの取得
  //   const branchref = await fetch(`http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`, {getmethod, headers})
  //   const parseref = await branchref.json()
  //   console.log('branch毎のハッシュ',`${branchName}` , parseref.object.sha)
    
  //   // commitの取得
  //   const commithttpRes = await fetch(`http://localhost:8085/.netlify/git/github/commits/${parseref.object.sha}`, {getmethod, headers})
  //   const commitres = await commithttpRes.json()
  //   console.log(':p~', commitres)
  //   // console.log(':p~', commitres, sendObj)

  //   const postcontents = {
  //     // content: 'dGVzdCBjb21taXQ=',
  //     // encoding: 'base64'
  //     content,
  //     encoding: 'utf-8'
  //   };
  //   const bodys = JSON.stringify(postcontents)
  //   // blobの作成
  //   const refhttpRes = await fetch(`http://localhost:8085/.netlify/git/github/git/blobs?ref=${branchName}`, {method: 'POST', headers, body: bodys}); // { headerss: {'Content-Type': 'application/json'}}
  //   const refres = await refhttpRes.json()
  //   console.log(':q~', refres)

  //   // const masmaster = await fetch('http://localhost:8085/.netlify/git/github/branches/master', {method: 'GET', headers})
  //   // const masres = await masmaster.json()

  //   // console.log(commitres.sha, masres.commit.sha) 同じ値
  //   const treesbody = 
  //   {
  //     // base_tree: commitres.sha,
  //     base_tree: commitres.commit.tree.sha,
  //     tree: [{
  //         path: 'test.csv',
  //         mode: '100644', // 100644  100755 , 040000 160000  シンボリックリンクのパス120000 
  //         type: 'blob',
  //         sha: refres.sha,
  //       }
  //       // ,
  //       // {
  //       //   path: ""
  //       // }
  //     ]
  //   }
  //   // treeの作成
  //   const treesbodys = JSON.stringify(treesbody)
  //   const branchhttpRes = await fetch('http://localhost:8085/.netlify/git/github/git/trees', {method: 'POST', headers, body: treesbodys});
  //   const branchres = await branchhttpRes.json()
  //   console.log("branchesres", branchres)
  //   console.log("check", refres.sha, branchres.sha, parseref.object.sha)
  //   let date = moment().format('YYYY-MM-DDTHH:mm:ssZ')
  //   console.log("time", date)

  //   const commitsbody = 
  //   {
  //     message: date,
  //     author: {
  //       name: "test",
  //       email: "hoge@gmail.com",
  //       // date: "2020-08-15T02:27:22.296Z"
  //       date
  //   },
  //     parents: [
  //       // refres.sha
  //       parseref.object.sha
  //     ],
  //     tree: branchres.sha
  //   }
  //   const commitsbodys = JSON.stringify(commitsbody)
  //   console.log(commitsbodys)
  //   // commitの作成
  //   const createcommithttpres = await fetch(`http://localhost:8085/.netlify/git/github/git/commits?ref=${branchName}`, {method: 'POST', headers, body: commitsbodys});
  //   const createcommitres = await createcommithttpres.json()
  //   console.log("commithash", createcommitres.sha)

  //   // refの更新
  //   const updatebody = {
  //     sha: createcommitres.sha,
  //     force: false // 強制pushするか否
  //   }
  //   const updatebodys = JSON.stringify(updatebody)
  //   const updaterefhttpres = await fetch(`http://localhost:8085/.netlify/git/github/git/refs/heads/${branchName}`, {method: 'PATCH', headers, body: updatebodys})
  //   const updaterefres = await updaterefhttpres.json()
  //   console.log('asdf', updaterefres)
  //   console.log(':(', csvObj)
  //   commit('setCsvObj', csvObj)
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

// const convertToCSV = (arr) => {
//   const array = [Object.keys(arr[0])].concat(arr)
//   return array.map(it => {
//     return Object.values(it).toString()
//   }).join('\n')
// }

const convertCsvToObjArray = (csv) => {
  //header:CSV1行目の項目 :csvRows:項目に対する値
  const [header, ...csvRows] = csv.split('\n').filter((row) => {
    if (row !== '') {
      return row;
    }
  }).map((row) => {
    return row.split(',');
  });

  let arrayInKeyAndValue;
  let resultArray;
  let tmpResultArray;

  tmpResultArray = csvRows.map((r) => {
    arrayInKeyAndValue = header.map((_, index) => {
      //ヘッダーの空白文字を削除。keyとvalueに値をセット
      return ({ key: header[index].replace(/\s+/g, ''), value: r[index] });
    });
    arrayInKeyAndValue = arrayInKeyAndValue.reduce((previous, current) => {
      //{key: "物", value: "MacBook", メーカー: "apple", 値段: "3000"}を作成
      previous[current.key] = current.value;
      return previous;
    }, {});
    return arrayInKeyAndValue;
  });

  resultArray = tmpResultArray.reduce((previous, current) => {
    previous[current.src] = current;
    return previous;
  }, {});
  return resultArray;
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
