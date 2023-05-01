module.exports = defineTest({
	description: 'supports es5-shim',
	options: {
		onwarn(warning) {
			if (warning.code !== 'THIS_IS_UNDEFINED') {
				throw new Error(warning.message);
			}
		},
		// TODO notable exception: Promise.resolve(thenable) not yet retained
		// check against tree-shake: false when updating the shim
		treeshake: true,
		plugins: [
			require('@rollup/plugin-node-resolve').default(),
			require('@rollup/plugin-commonjs')()
		]
	}
});
