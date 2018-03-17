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
			'Unknown CLI flag: unknownOption. Allowed options: acorn, acornInjectPlugins, amd, banner, c, cache, config, context, d, dir, e, entry, environment, experimentalCodeSplitting, experimentalDynamicImport, experimentalPreserveModules, exports, extend, external, f, file, footer, format, freeze, g, globals, h, i, indent, input, interop, intro, l, legacy, m, moduleContext, n, name, namespaceToStringTag, noConflict, o, onwarn, outro, paths, perf, plugins, preferConst, preserveSymlinks, silent, sourcemap, sourcemapFile, strict, treeshake, v, w, watch');
	}
});
