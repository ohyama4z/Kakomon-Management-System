module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    ["env", { "modules": false }]
  ],
  env: {
    test: {
      presets: [["env", { "targets": { "node": "current" } }]]
    }
  }
}
