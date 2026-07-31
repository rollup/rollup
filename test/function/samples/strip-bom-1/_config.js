const commonjs = require('@rollup/plugin-commonjs');
const assert = require('node:assert');

module.exports = defineTest({
	description: 'Works correctly with BOM files and the @rollup/plugin-commonjs plugin.',
	options: {
		strictDeprecations: false,
		plugins: [commonjs()]
	},
	warnings: warnings => {
		assert.ok(warnings.every(warning => warning.code === 'DEPRECATED_FEATURE'));
	}
});
