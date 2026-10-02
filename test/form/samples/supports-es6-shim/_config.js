module.exports = defineTest({
	description: 'supports es6-shim',
	options: {
		strictDeprecations: false,
		onwarn(warning) {
			if (warning.code !== 'THIS_IS_UNDEFINED') {
				throw new Error(warning.message);
			}
		},
		// check against tree-shake: false when updating the shim
		treeshake: true,
		plugins: [
			require('@rollup/plugin-node-resolve').default(),
			require('@rollup/plugin-commonjs').default()
		]
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
