import { defineConfig } from 'tsup';

export default defineConfig([
  // CLI entry point
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    shims: true,
    target: 'node18',
    outExtension() {
      return {
        js: '.mjs',
      };
    },
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // Library exports
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: false,
    shims: true,
    target: 'node18',
    outExtension() {
      return {
        js: '.mjs',
      };
    },
  },
]);
