// This is a CJS plugin
import replace from '@rollup/plugin-replace/dist/rollup-plugin-replace.cjs.js';
// This is an ESM plugin
import { shebang } from 'rollup-plugin-thatworks';
import nestedPlugin from './nested/plugin.mjs';
import plugin from './plugin.mjs';

export default {
	input: 'main.js',
	output: { format: 'cjs', exports: 'auto' },
	plugins: [shebang(), replace({ ANSWER: 42 }), plugin(), nestedPlugin()]
};
