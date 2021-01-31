module.exports = {
  env: {
    browser: true,
    es6: true,
    'jest/globals': true
  },
  extends: ['plugin:vue/essential', 'prettier-standard'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parser: '@typescript-eslint/parser'
  },
  plugins: ['vue', 'jest', '@typescript-eslint'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
