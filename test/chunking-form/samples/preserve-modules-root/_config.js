const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').default;

module.exports = defineTest({
	description: 'confirm preserveModulesRoot restructures src appropriately',
	expectedWarnings: ['MIXED_EXPORTS'],
	options: {
		input: ['src/under-build.js', 'src/below/module.js'],
		plugins: [
			{
				name: 'convert-slashes',
				// This simulates converted slashes as used by e.g. Vite
				async resolveId(source, importer, options) {
					const resolved = await this.resolve(source, importer, options);
					return { ...resolved, id: resolved.id.replace(/\\/g, '/') };
				}
			},
			resolve({
				moduleDirectories: ['custom_modules']
			}),
			commonjs()
		],
		output: {
			preserveModules: true,
			preserveModulesRoot: 'src'
		}
	}
});
