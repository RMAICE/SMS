import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals.browser,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs['recommended-flat'],
  {
    rules: {
      'no-undef': 'off',
    },
  },
)
