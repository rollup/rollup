module.exports = defineTest({
	description: 'does not merge shared modules into an awaiting entry',
	formats: ['es', 'system'],
	options: {
		input: 'main.js',
		output: { experimentalMinChunkSize: 100 }
	}
});
