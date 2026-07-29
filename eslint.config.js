import js from '@eslint/js'
import prettier from '@vue/eslint-config-prettier'
import typescript from '@vue/eslint-config-typescript'
import vue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['dist', 'coverage'],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  ...typescript(),
  prettier,
]
