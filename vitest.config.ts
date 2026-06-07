import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // antd v6 + jsdom 冷启动 import 较慢，放宽超时避免首次渲染误判超时
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
