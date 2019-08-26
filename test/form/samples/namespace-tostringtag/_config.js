module.exports = {
	description: 'namespace toStringTag support',
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	options: {
		output: {
			name: 'iife',
			namespaceToStringTag: true
		}
	}
};
