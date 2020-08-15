export default {
  currentUser: netlifyIdentity.currentUser(),
  lastPage: 'upload',
  metadatas: {
    status: 'unrequested',
    data: []
  },

  setCsvObj: {
    status: 'unrequested',
  },

  files: [
    {
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
    }
  ],
  img: [
    {
      src: '001',
      img: 'blob:http://localhost:8082/9a582659-277b-4242-8e12-264754e0ae6c'
    },
    {
      src: '002',
      img: 'blob:http://localhost:8082/b230aec2-fe23-461f-84ad-5a21945f8ea1'
    }
  ]
}