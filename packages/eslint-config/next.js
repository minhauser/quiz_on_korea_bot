/**
 * ESLint config for the Next.js frontend.
 * Apps must also extend `next/core-web-vitals` (provided by eslint-config-next).
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  extends: ['./index.js', 'plugin:jsx-a11y/recommended'],
  env: {
    browser: true,
    node: true,
  },
  plugins: ['jsx-a11y'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
