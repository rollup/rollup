module.exports = {
	description: 'compact output with compact: true',
	options: {
		external: ['external'],
		output: {
			name: 'foo',
			compact: true,
			namespaceToStringTag: true
		}
	}
};
