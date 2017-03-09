module.exports = {
	description: 'does not introduce conflicting variables with treeshake: false',
	options: {
		moduleName: /* not shaken, but */ 'stirred',
		treeshake: false
	}
};
