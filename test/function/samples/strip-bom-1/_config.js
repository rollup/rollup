const commonjs = require('@rollup/plugin-commonjs');

module.exports = defineTest({
	description: 'Works correctly with BOM files and the @rollup/plugin-commonjs plugin.',
	options: {
		plugins: [commonjs()]
	}
});
