const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').default;

module.exports = {
	description: 'confirm preserveModulesRoot restructures src appropriately',
	expectedWarnings: ['MIXED_EXPORTS'],
	options: {
		input: ['src/under-build.js', 'src/below/module.js'],
		plugins: [
			resolve({
				customResolveOptions: {
					moduleDirectory: ['custom_modules']
				}
			}),
			commonjs()
		],
		output: {
			preserveModules: true,
			preserveModulesRoot: 'src'
		}
	}
};
