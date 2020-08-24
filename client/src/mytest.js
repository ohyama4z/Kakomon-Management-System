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

// 画像データについてのstateの構造例
// const state: {
//   imageMetadatas: {
//     'fileSha1': {
//       status: 'loaded',
//       data: {
//         'src1.jpg': {},
//         'src2.jpg': {}
//       }
//     },
//     'fileSha2': {
//       status: 'loaded',
//       data: {
//         'src3.jpg': {},
//         'src4.jpg': {}
//       }
//     }
//   }
// }

// state.imageShas[commitSha][directoryPath] = {
//   status: 'loaded',
//   data: {
//     '----.jpg': 'a40c3ee1ebd4aa6ae0479c47b93438b2'
//     '----.jpg': 'a40c3ee1ebd4aa6ae0479c47b93438b2'
//   }
// }
