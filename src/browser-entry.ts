import '../typings/package.json';

export { version as VERSION } from '../package.json' with { type: 'json' };
export { defineConfig, default as rollup } from './rollup/rollup';
