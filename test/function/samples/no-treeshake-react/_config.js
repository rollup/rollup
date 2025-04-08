module.exports = defineTest({
	description: 'passes when bundling React without tree-shaking',
	options: {
		treeshake: false,
		plugins: [
			require('@rollup/plugin-node-resolve').default(),
			require('@rollup/plugin-commonjs')()
		]
	}
});
