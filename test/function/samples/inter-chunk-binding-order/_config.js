module.exports = {
	// solo: true,
	description: 'retains the order of imports between chunks',
	context: { execution: { index: 0 } },
	options: {
		experimentalCodeSplitting: true,
		input: ['main.js', 'chunk1.js', 'chunk2.js']
	}
};
