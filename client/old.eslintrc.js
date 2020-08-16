module.exports = {
  parser: "vue-eslint-parser",
  parserOptions: {
    "parser": "babel-eslint"
  },
  plugins: [
    "vue"
  ],
  extends: [
    // add more generic rulesets here, such as:
    'eslint:recommended',
    'plugin:vue/recommended',
    "plugin:prettier/recommended",
    "prettier/vue"
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
  }
}