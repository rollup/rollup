module.exports = defineTest({
	description: 'bundle transformers can be asynchronous',
	options: {
		plugins: [
			{
				renderChunk(code) {
					return Promise.resolve(code.replace('x', 1));
				}
			},
			{
				renderChunk(code) {
					return code.replace('1', 2);
				}
			},
			{
				renderChunk(code) {
					return Promise.resolve(code.replace('2', 3));
				}
			}
		]
	}
});
