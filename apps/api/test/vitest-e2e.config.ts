import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['**/*.e2e-spec.ts', 'test/**/*.e2e.ts'],
    hookTimeout: 30_000,
    testTimeout: 30_000,
    fileParallelism: false,
  },
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
