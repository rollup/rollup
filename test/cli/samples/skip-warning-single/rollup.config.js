var assert = require('assert');

let warnings = [];

module.exports = commands => ({
	input: 'main.js',
	plugins: [
		{
			ongenerate() {
				assert.deepEqual(warnings, [
					'CIRCULAR_DEPENDENCY',
					'UNUSED_EXTERNAL_IMPORT',
				]);
			}
		},
	],
	onwarn(warning) {
		warnings.push(warning.code);
	},
});
