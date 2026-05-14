export default [
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.vue']
  },
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
]
