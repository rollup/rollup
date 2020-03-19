// This is an ESM plugin
// And this is CJS
import replace from '@rollup/plugin-replace/dist/rollup-plugin-replace.cjs.js';
import { shebang } from 'rollup-plugin-thatworks';

export default {
	input: 'main.js',
	output: { format: 'cjs' },
	plugins: [shebang(), replace({ ANSWER: 42 })]
};
