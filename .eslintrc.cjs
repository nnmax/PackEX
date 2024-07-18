/** @type {import('eslint').Linter.Config} */
const config = {
  root: true,
  extends: ['plugin:@tanstack/eslint-plugin-query/recommended', '@nnmax/eslint-config-react', 'prettier'],
  plugins: ['eslint-plugin-react-compiler', 'react-refresh'],
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'react-compiler/react-compiler': 'error',
    'react-refresh/only-export-components': [
      'error',
      {
        allowConstantExport: true,
      },
    ],
  },
}

module.exports = config
