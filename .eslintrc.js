module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'standard'
  ],
  parser: 'babel-eslint',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: [
    'vue'
  ],
  rules: {
    // 要求缩进采用2个空格
    indent: [
      'error',
      2,
      {
        SwitchCase: 1
      }
    ],
    'vue/max-attributes-per-line': ['error'],
    // 要求块语句和类的开始或末尾有空行
    // 'padded-blocks': ['error', 'always'],
    // 要求缩进采用2个空格
    'vue/html-indent': ['error', 2],

    // 可以不强制使用自闭合标签
    'vue/no-v-html': 'off',
    'vue/html-self-closing': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/require-v-for-key': 'off',
    'vue/valid-v-for': 'off',
    // "vue/component-name-in-template-casing": ["error", "kebab-case", {
    //   "registeredComponentsOnly": false,
    //   "ignores": []
    // }],
  }
}
