/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@ksp/eslint-config/nest'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'vitest.config.ts', 'test/**/*.config.ts'],
};
