module.exports = {
	description: 'adds Symbol.toStringTag property to entry chunks with named exports',
	options: {
		output: {
			namespaceToStringTag: true,
			exports: 'named',
			name: 'bundle'
		}
	}
};
