module.exports = defineTest({
	description: 'supports core-js',
	options: {
		// check against tree-shake: false when updating the polyfill
		treeshake: true,
		plugins: [
			require('@rollup/plugin-node-resolve').default(),
			require('@rollup/plugin-commonjs')()
		]
	}
});
