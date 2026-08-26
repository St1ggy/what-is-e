import config from '@st1ggy/linter-config/eslint-svelte'

export default [
  ...config,
  {
    files: ['**/*.svelte'],
    rules: {
      '@typescript-eslint/no-deprecated': 'error',
      'prefer-const': 'off',
      // This SonarJS rule crashes on Svelte's transformed source; the typed rule above covers deprecations.
      'sonarjs/deprecation': 'off',
      'unicorn/no-top-level-assignment-in-function': 'off',
      'unicorn/no-unused-properties': 'off',
    },
  },
  {
    files: ['*.{js,ts}', 'scripts/**/*.{js,mjs,ts}'],
    languageOptions: {
      parserOptions: { project: ['tsconfig.eslint.json'] },
    },
  },
  {
    files: ['src/service-worker.ts'],
    languageOptions: {
      parserOptions: { project: ['tsconfig.service-worker.json'] },
    },
    rules: {
      'import-x/no-unresolved': 'off',
    },
  },
  {
    files: ['scripts/**/*.{js,mjs,ts}'],
    rules: {
      'no-console': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },
  {
    files: ['src/routes/**/*.{js,ts,svelte}'],
    rules: {
      'import-x/no-unresolved': 'off',
      'unicorn/consistent-boolean-name': 'off',
    },
  },
]
