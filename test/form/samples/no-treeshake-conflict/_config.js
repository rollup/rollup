module.exports = {
	description: 'does not introduce conflicting variables with treeshake: false',
	options: {
		output: { name: /* not shaken, but */ 'stirred' },
		treeshake: false
	}
};
