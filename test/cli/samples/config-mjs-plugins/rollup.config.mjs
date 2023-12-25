import replace from '@rollup/plugin-replace';
import nestedPlugin from './nested/plugin.mjs';
import plugin from './plugin.mjs';

export default {
	input: 'main.js',
	output: { format: 'cjs', exports: 'auto' },
	plugins: [replace({ preventAssignment: true, ANSWER: 42 }), plugin(), nestedPlugin()]
};
