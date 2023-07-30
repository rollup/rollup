module.exports = defineTest({
	// TODO SWC skipped for now as problematic utf-8 characters are encoded differently in the AST
	skip: true,
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
