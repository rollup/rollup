module.exports = defineTest({
	description: 'reflects changes in renderChunk',
	options1: {
		input: 'main',
		plugins: [
			{
				renderChunk(code, chunk) {
					if (chunk.name === 'main') {
						return "console.log('first');" + code;
					}
				}
			}
		]
	},
	options2: {
		input: 'main',
		plugins: [
			{
				renderChunk(code, chunk) {
					if (chunk.name === 'main') {
						return "console.log('second');" + code;
					}
				}
			}
		]
	}
});
