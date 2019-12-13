const commonjs = require('rollup-plugin-commonjs');

module.exports = {
	description: 'Handles output from rollup-plugin-commonjs',
	expectedWarnings: ['MIXED_EXPORTS'],
	options: {
		input: 'main.js',
		preserveModules: true,
		external: ['external'],
		plugins: [commonjs()]
	}
};
