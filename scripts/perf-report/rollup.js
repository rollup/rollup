process.env.PERF_ENTRY = 'dist/shared/rollup.js';
process.env.PERF_COMMONJS = '1';
process.env.PERF_SOURCEMAP = '1';

await import('./index.js');
