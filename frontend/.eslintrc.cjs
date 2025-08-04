module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    // Existing rules
    'react/jsx-no-target-blank': 'off', // Already off: Disables warning for target="_blank" without rel="noreferrer"
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // Additional rules turned off
    'react/prop-types': 'off', // Disables prop-types validation (common when using TypeScript or not using PropTypes)
    'react/no-unescaped-entities': 'off', // Allows unescaped HTML entities in JSX
    'react/display-name': 'off', // Disables requirement for displayName in components (useful for memoized components)
    'no-unused-vars': 'off', // Disables warnings for unused variables (use with caution)
    'react-hooks/exhaustive-deps': 'off', // Disables warnings for missing dependencies in useEffect/useCallback
  },
};