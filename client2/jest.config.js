module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  "moduleFileExtensions": [
    "js",
    "json",
    "vue"
  ],
  "transform": {
    ".*\\.(vue)$": "vue-jest",
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "setupFilesAfterEnv": [
    "./src/setupTests.js"
  ],
  "coverageDirectory": "./coverage/",
  "collectCoverage": false,
  "collectCoverageFrom": [
    "**/*.{js,vue}",
    "!**/mytest.*",
    "!**/node_modules/**"
  ],
  "setupFiles": [
    "jest-localstorage-mock",
    "./src/setupTests.js"
  ],
  "transformIgnorePatterns": [
    "/node_modules/(?!vuikit)"
  ]
};
