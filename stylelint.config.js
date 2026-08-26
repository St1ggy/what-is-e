import config from '@st1ggy/linter-config/stylelint-scss'

export default {
  ...config,
  rules: {
    ...config.rules,
    'plugin/no-unsupported-browser-features': [
      true,
      {
        browsers: [
          'last 2 Chrome versions',
          'last 2 Edge versions',
          'last 2 Firefox versions',
          'last 2 Safari versions',
          'iOS >= 16.4',
        ],
        ignore: ['css-nesting', 'css-scrollbar'],
        ignorePartialSupport: true,
        severity: 'warning',
      },
    ],
  },
}
