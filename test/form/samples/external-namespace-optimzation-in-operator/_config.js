module.exports = {
	description: 'disables optimization for external namespace when using the in operator',
	options: {
		external: ['node:crypto', './ext.js']
	}
};
