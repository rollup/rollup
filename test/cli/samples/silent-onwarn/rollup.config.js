import assert from 'assert';

const warnings = [];

export default {
	input: 'main.js',
	output: {
		format: 'es'
	},
	onwarn(warning) {
		warnings.push(warning);
	},
	plugins: {
		generateBundle(bundle) {
			assert.strictEqual(warnings.length, 1);
			assert.strictEqual(warnings[0].code, 'CIRCULAR_DEPENDENCY');
		}
	}

}
