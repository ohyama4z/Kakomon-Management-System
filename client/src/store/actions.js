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

  getBranchData: async ({ commit, state }, branchName) => {
    commit('setStatusLoading', state.setCsvObj)

    const token = state.currentUser.token.access_token
    const method = 'GET'
    const headers = {
      Authorization: `Bearer ${token}`
    }
    console.log(branchName)
    const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas?ref=${branchName}`, {method, headers})
    // const httpRes = await fetch(`http://localhost:8085/.netlify/git/github/contents/metadatas/unassorted.csv?ref=${branchName}`, {method, headers})
    const resArr = await httpRes.json()
    console.log('^_^',resArr)

    let csvObj = {}
    const pool = new PromisePool(50) // 50 tasks at once

    resArr.forEach(res => {
      pool.open(async () => {
        const previousResStr = localStorage.getItem(`${branchName}_${res.name}`)
        const previousRes = JSON.parse(previousResStr)
        
        if (previousRes == null || res.sha !== previousRes.sha) {
          console.log('manukemanuke')
          const httpResponse = await fetch(`http://localhost:8085/.netlify/git/github/git/blobs/${res.sha}?ref=${branchName}`, {method, headers})
          const response = await httpResponse.json()
          const strRes = JSON.stringify(response)
          localStorage.setItem(`${branchName}_${res.name}`,strRes)
        }

        const curResStr = localStorage.getItem(`${branchName}_${res.name}`)
        const curRes = JSON.parse(curResStr)
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

    
    
    console.log(':(', csvObj)

    commit('setCsvObj', csvObj)
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
