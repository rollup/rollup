module.exports = defineTest({
	description: 'preserves awaited edges when the import target is an explicit input',
	formats: ['es', 'system'],
	options: {
		input: ['main.js', 'entry.js'],
		output: { experimentalMinChunkSize: 100 }
	}
});
