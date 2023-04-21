module.exports = {
	description: 'all code should be included if tree-shaking is disabled',
	options: {
		external: ['external'],
		treeshake: false,
		output: {
			globals: { external: 'external' },
			name: /* not shaken, but */ 'stirred',
			inlineDynamicImports: true
		}
	}
};
