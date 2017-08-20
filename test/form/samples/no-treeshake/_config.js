module.exports = {
	description: 'all code should be included if tree-shaking is disabled',
	options: {
		external: [ 'external' ],
		globals: {
			external: 'external'
		},
		name: /* not shaken, but */ 'stirred',
		treeshake: false
	}
};
