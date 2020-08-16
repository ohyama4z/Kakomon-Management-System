import PromisePool from 'native-promise-pool'
import netlifyIdentity from 'netlify-identity-widget'

export default {
  upload: async ({ commit }, newFile) => {
    commit('upload',newFile)
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

  getBranchData: async ({ commit, state }, branchName) => {
    commit('setStatusLoading', state.setCsvObj)

    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    console.log(`selected branch is branch:${branchName}`)
    const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${branchName}`, {method, headers})
    // const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas/unassorted.csv?ref=${branchName}`, {method, headers})
    const resArr = await httpRes.json()
    // console.log('^_^',resArr)

    let csvObj = {}
    const pool = new PromisePool(50) // 50 tasks at once

    resArr.forEach(res => {
      pool.open(async () => {
        const previousRes = state.setCsvObj.unparsedData[`${branchName}`]?.[`${res.name}`]
        // state.setCsvObj.unparsedData[`${branchName}`]?.[`${res.name}`]の
        // ?. の部分がわからないときはOptional Chaningでググれ
        
        if (previousRes == null || res.sha !== previousRes.sha) {
          const httpResponse = await fetch(`http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${branchName}`, {method, headers})
          const response = await httpResponse.json()
          commit('branchDataOnGithub' ,{
            branchData: response,
            branchName,
            fileName: res.name
          })
        }

        const curRes = state.setCsvObj.unparsedData[`${branchName}`][`${res.name}`]
        const buffer = new Buffer(curRes.content, 'base64')
        const csvData = buffer.toString('utf8')
        const resultObj = convertCsvToObjArray(csvData);

        csvObj = Object.assign(csvObj, resultObj)
      })
    })

    
    
    console.log(':(', csvObj)

    commit('setCsvObj', csvObj)
  },

  updateCurrentUser: async ({ commit }) => {
    const user = netlifyIdentity.currentUser()
    if(user != null && user.token.access_token == null) {
      await netlifyIdentity.refresh()
    }
    commit('updateCurrentUser', user)
  }
}

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
