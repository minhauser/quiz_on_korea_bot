import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.module.ts',
        'src/**/*.dto.ts',
        'src/**/index.ts',
        'src/main.ts',
      ],
    },
  },
  // SWC transforms decorators + emitDecoratorMetadata for Nest under Vitest.
  plugins: [swc.vite({ module: { type: 'es6' } })],
});
