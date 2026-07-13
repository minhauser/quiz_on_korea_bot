/**
 * ESLint config for the NestJS backend.
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['./index.js'],
  env: {
    node: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    // Decorator-heavy DI: parameter properties are idiomatic in Nest.
    'no-useless-constructor': 'off',
  },
};
