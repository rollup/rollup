const commonjs = require('@rollup/plugin-commonjs');

module.exports = defineTest({
	description: 'Handles output from @rollup/plugin-commonjs',
	expectedWarnings: ['MIXED_EXPORTS', 'DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		input: 'main.js',
		preserveModules: true,
		external: ['external'],
		plugins: [commonjs()]
	}
});
