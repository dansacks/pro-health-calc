import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.js',
    include: ['test/**/*.test.{js,jsx}'],
    // Do not shorten long scenario descriptions used as test names.
    taskTitleValueFormatTruncate: Infinity,
    reporters: ['default', './test/reporters/plainEnglishReporter.js'],
  },
});
