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

// setTimeout(() => {console.log(1)}, 1000)
// setTimeout(() => {console.log(2)}, 1000)
// setTimeout(() => {console.log(3)}, 1000)


// setTimeout(() => {
//   console.log(1)
//   setTimeout(() => {
//     console.log(2)
//     setTimeout(() => {
//       console.log(3)
//     }, 1000)
//   }, 1000)
// },1000)

const wait = () => new Promise((resoleve, reject) => {setTimeout(() => {
      resoleve()
    }, 1000)
  })

// wait().then(() => {
//   console.log(1)
//   wait().then(() => {
//     console.log(2)
//     wait().then(() => {
//       console.log(3)
//     })
//   })
// })

// wait().then(() => {
//   console.log(2)
// })

// wait().then(() => {
//   console.log(3)
// })
const count = async () => {
  await wait()
  console.log(1)
  await wait()
  console.log(2)
  await wait()
  console.log(3)
}

count()