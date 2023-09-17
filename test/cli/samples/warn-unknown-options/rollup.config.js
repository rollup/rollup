const assert = require('node:assert');
const replace = require('@rollup/plugin-replace');

let warnings = 0;

module.exports = commands => ({
	input: 'main.js',
	plugins: [
		{
			generateBundle() {
				assert.strictEqual(warnings, 1);
			}
		},
		replace({ preventAssignment: true, ANSWER: commands.configAnswer })
	],
	onwarn(warning) {
		warnings++;
		assert.equal(warning.code, 'UNKNOWN_OPTION');
		assert.equal(
			warning.message,
			`Unknown CLI flags: unknownOption. Allowed options: ${
				require('../../../misc/optionList').flags
			}`
		);
	}
});
