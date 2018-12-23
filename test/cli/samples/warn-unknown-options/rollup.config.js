var replace = require('rollup-plugin-replace');
var assert = require('assert');

let warnings = 0;

module.exports = commands => ({
	input: 'main.js',
	plugins: [
		{
			ongenerate() {
				assert.equal(warnings, 2);
			}
		},
		replace({ 'ANSWER': commands.configAnswer }),
	],
	onwarn(warning) {
		warnings++;
		if (warnings === 1) {
			assert.equal(warning.code, 'UNKNOWN_OPTION');
			assert.equal(warning.message,
				`Unknown CLI flag: unknownOption. Allowed options: ${require('../../../misc/optionList').flags}`);
		}
		else {
			assert.equal(warning.code, 'PLUGIN_WARNING');
			assert.equal(warning.message,
				`The ongenerate hook used by plugin at position 1 is deprecated. The generateBundle hook should be used instead.`);
		}
	}
});
