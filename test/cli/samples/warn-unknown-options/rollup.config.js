var replace = require('rollup-plugin-replace');
var assert = require('assert');

let warnings = 0;

module.exports = commands => ({
	input: 'main.js',
	plugins: [
		{
			generateBundle() {
				assert.strictEqual(warnings, 1);
			}
		},
		replace({ ANSWER: commands.configAnswer })
	],
	onwarn(warning) {
		warnings++;
		assert.equal(warning.code, 'UNKNOWN_OPTION');
		assert.equal(
			warning.message,
			`Unknown CLI flag: unknownOption. Allowed options: ${
				require('../../../misc/optionList').flags
			}`
		);
	}
});
