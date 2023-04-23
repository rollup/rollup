module.exports = defineTest({
	description: 'runs output plugins last',
	options: {
		plugins: [
			{
				name: 'input',
				renderChunk(code) {
					return `/* input */\n${code}\n/* input */`;
				}
			}
		],
		output: {
			plugins: [
				{
					name: 'output',
					renderChunk(code) {
						return `/* output */\n${code}\n/* output */`;
					}
				}
			]
		}
	}
});
