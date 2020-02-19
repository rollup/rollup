module.exports = {
	description: 'supports core-js',
	options: {
		// check against tree-shake: false when updating the polyfill
		treeshake: true,
		plugins: [require('@rollup/plugin-node-resolve')(), require('@rollup/plugin-commonjs')()]
	}
};
