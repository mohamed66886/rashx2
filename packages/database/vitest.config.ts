import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: process.env.FIRESTORE_EMULATOR_HOST
      ? ['node_modules', 'dist']
      : ['test/firestore.rules.test.ts', 'test/appointment.concurrency.test.ts', 'node_modules', 'dist'],
  },
  resolve: {
    conditions: ['react-server', 'node'],
    alias: {
      'next/server': path.resolve(__dirname, '../../apps/tenant/node_modules/next/server.js'),
    },
  },
});

