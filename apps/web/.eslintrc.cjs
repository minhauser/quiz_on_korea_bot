/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@ksp/eslint-config/next', 'next/core-web-vitals'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  settings: {
    next: {
      rootDir: 'apps/web',
    },
  },
  ignorePatterns: ['.next', 'node_modules', 'next-env.d.ts', 'coverage', 'playwright-report'],
};
