module.exports = {
  configureWebpack: {
    devServer: {
      watchOptions: {
        poll: true
      }
    }
    // module: {
    //   rules: [
    //     {
    //       enforce: 'pre',
    //       test: /\.(js|vue)$/,
    //       loader: 'eslint-loader',
    //       exclude: /node_modules/,
    //       options: {
    //         emitWarning: true
    //       }
    //     }
    //   ]
    // }
  }
}
