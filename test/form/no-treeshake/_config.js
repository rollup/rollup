module.exports = {
	description: 'all code should be included if tree-shaking is disabled',
	options: {
		external: [ 'external' ],
		globals: {
			external: 'external'
		},
		moduleName: /* not shaken, but */ 'stirred',
		treeshake: false
	}
};
