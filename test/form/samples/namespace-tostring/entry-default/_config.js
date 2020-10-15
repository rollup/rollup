module.exports = {
	description: 'does not add Symbol.toStringTag property to entry chunks with default export mode',
	options: {
		output: {
			namespaceToStringTag: true,
			exports: 'default',
			name: 'bundle'
		}
	}
};
