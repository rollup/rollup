var replace = require('rollup-plugin-replace');
var assert = require('assert');

let warnings = 0;

module.exports = commands => ({
	input: 'main.js',
	plugins: [
		{
			ongenerate() {
				assert.equal(warnings, 1);
			}
		},
		replace({ 'ANSWER': commands.configAnswer }),
	],
	onwarn(warning) {
		warnings++;
		assert.equal(warning.code, 'UNKNOWN_OPTION');
		assert.equal(warning.message,
			'Unknown CLI option: unknownOption. Allowed options: acorn, acornInjectPlugins, c, cache, config, context, d, dir, e, entry, experimentalCodeSplitting, experimentalDynamicImport, experimentalPreserveModules, external, f, g, h, i, input, l, legacy, m, moduleContext, n, o, onwarn, output, perf, plugins, preferConst, preserveSymlinks, strict, treeshake, v, w, watch');
	}
});
