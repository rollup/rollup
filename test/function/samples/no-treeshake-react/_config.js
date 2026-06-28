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
	expectedWarnings: ['DEPRECATED_FEATURE']
});
