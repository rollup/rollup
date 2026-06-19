import package_ from '../package.json' with { type: 'json' };

export const VERSION = package_.version;
export { defineConfig, default as rollup } from './rollup/rollup';
