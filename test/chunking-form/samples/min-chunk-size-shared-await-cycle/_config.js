module.exports = defineTest({
	description: 'does not merge helpers into a shared chunk containing top-level await',
	formats: ['es', 'system'],
	options: {
		input: ['a.js', 'b.js'],
		output: { experimentalMinChunkSize: 100 }
	}
});
