import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
  bundle: true,
  platform: 'browser',
  format: 'esm',
  sourcemap: true,
  minify: true,
  external: ['webextension-polyfill'],
}).catch(() => process.exit(1));