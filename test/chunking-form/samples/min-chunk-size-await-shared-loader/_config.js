module.exports = defineTest({
	description: 'does not merge a statically depended loader into an awaiting chunk',
	formats: ['es', 'system'],
	options: {
		input: 'main.js',
		output: { experimentalMinChunkSize: 100 }
	}
});
