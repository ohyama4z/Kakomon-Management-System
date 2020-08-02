// const STO = (num,ms) => new Promise(resolve => setTimeout(() => {
//         console.log(num)
//         resolve()
//     }, ms))

// const count = async () => {
//     await STO(1, 1000)
//     await STO(2, 1000)
//     await STO(3, 1000)
// }

// count()

// const arr = ['ここは0', 'ここは1', 'ここが最後尾(-1)']

// const data = 'k'

// console.log(arr[arr.length-1])
function getSidebarMenu () {
  const header = [{
    header: true,
    title: '過去問管理',
    hiddenOnCollapse: true
  }]

  return header.concat(this.getMenuStructure)
}

function intermediateFiles () {
  const sampleFiles = [{
      src: '001',
      subject: '数学',
      year: 2019,
      toolType: '勉強用',
      period: '前期定期',
      contentType: 'ノート',
      author: 'oy',
      fileName: 'file001'
    },
    {
      src: '002',
      subject: '英語',
      year: 2019,
      toolType: '勉強用',
      period: '後期中間',
      contentType: 'まとめ',
      author: 'oy',
      fileName: 'file002'
    },
    {
      src: '003',
      subject: '英語',
      year: 2018,
      toolType: '勉強用',
      period: '後期中間',
      contentType: 'ノート',
      author: 'oy',
      fileName: 'file003'
    },
    {
      src: '004',
      subject: '英語',
      year: 2018,
      toolType: 'テスト',
      period: '前期定期',
      contentType: '問題',
      author: '松田',
      fileName: 'file004'
    },
    {
      src: '005',
      subject: '論理回路',
      year: 2018,
      toolType: '勉強用',
      period: '後期中間',
      contentType: 'ノート',
      author: 'oy',
      fileName: 'file005'
    },
    {
      src: '006',
      subject: '数学',
      year: 2018,
      toolType: '勉強用',
      period: '後期中間',
      contentType: 'ノート',
      author: 'oy',
      fileName: 'file006'
    },
    {
      src: '007',
      subject: '英語',
      year: 2018,
      toolType: '勉強用',
      period: '後期中間',
      contentType: 'ノート',
      author: 'sk',
      fileName: 'file007'
    },
    {
      src: '008',
      subject: '数学',
      year: 2019,
      toolType: 'テスト',
      period: '前期中間',
      contentType: '問題',
      author: '藤島',
      fileName: 'file008'
    },
    {
      src: '009',
      subject: '数学',
      year: 2019,
      toolType: '勉強用',
      period: '前期定期',
      contentType: '対策プリント',
      author: '藤島',
      fileName: 'file009'
    },
    {
      src: '010',
      subject: '英語',
      year: 2018,
      toolType: '勉強用',
      period: '後期中間',
      contentType: '対策プリント',
      author: 'oy',
      fileName: 'file010'
    },
  ]
  return sampleFiles.reduce((previous, current) => {
    if (previous == null) {
      previous = {}
    }

    if (previous[current.period] == null) {
      previous[current.period] = {}
    }

    if (previous[current.period][current.subject] == null) {
      previous[current.period][current.subject] = {}
    }


    if (previous[current.period][current.subject][current.toolType] == null) {
      previous[current.period][current.subject][current.toolType] = {}
    }

    if (previous[current.period][current.subject][current.toolType][current.year] == null) {
      previous[current.period][current.subject][current.toolType][current.year] = {}
    }

    if (previous[current.period][current.subject][current.toolType][current.year][current.contentType] == null) {
      previous[current.period][current.subject][current.toolType][current.year][current.contentType] = []
    }

    previous[current.period][current.subject][current.toolType][current.year][current.contentType].push(current)

    return previous
  }, {})
}

function getMenuStructure () {
  const icon = 'fa fa-folder'
  return Object.entries(this.intermediateFiles).reduce((previous, [period, value]) => {
    previous.push({
      title: period,
      icon,
      child: generateChildOfPeriod(value)
    })
    return previous
  }, [])

  function generateChildOfPeriod(yearValue) {
    return Object.entries(yearValue).reduce((previous, [subject, subjectValue]) => {
      previous.push({
        title: subject,
        icon,
        child: generateChildOfSubject(subjectValue)
      })
      return previous
    }, [])
  }

  function generateChildOfSubject(subjectValue) {
    return Object.entries(subjectValue).reduce((previous, [toolType, toolTypeValue]) => {
      previous.push({
        title: toolType,
        icon,
        child: generateChildOfToolType(toolTypeValue)
      })
      return previous
    }, [])
  }

  function generateChildOfToolType(toolTypeValue) {
    return Object.entries(toolTypeValue).reduce((previous, [year, yearValue]) => {
      previous.push({
        title: year,
        icon,
        child: generateChildOfYear(yearValue)
      })
      return previous
    }, [])
  }

  function generateChildOfYear(yearValue) {
    return Object.entries(yearValue).reduce((previous, [contentType, contentTypeValue]) => {
      previous.push({
        title: contentType,
        icon,
        child: generateChildOfContentType(contentTypeValue)
      })
      return previous
    }, [])
  }

  function generateChildOfContentType(contentTypeValue) {
    return contentTypeValue.map(file => {
      return {
        title: file.fileName,
        icon: 'fa fa-file'
      }
    })
  }
}

console.log(getSidebarMenu ())