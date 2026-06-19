import replace from '@rollup/plugin-replace';
import package_ from './package.json' with { type: 'json' };

module.exports = {
	input: 'main.js',
	output: {
		format: 'cjs'
	},
	plugins: [replace({ preventAssignment: true, __VERSION__: package_.version })]
};
