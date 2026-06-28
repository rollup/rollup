const assert = require('node:assert');

module.exports = defineTest({
	description: 'passes when bundling React without tree-shaking',
	options: {
		strictDeprecations: false,
		treeshake: false,
		plugins: [
			require('@rollup/plugin-node-resolve').default(),
			require('@rollup/plugin-commonjs')()
		]
	},
	warnings: warnings => {
		assert.ok(warnings.every(warning => warning.code === 'DEPRECATED_FEATURE'));
	}
});
