module.exports = defineTest({
	description: 'throws error only with first plugin renderChunk',
	options: {
		plugins: [
			{
				name: 'plugin1',
				renderChunk() {
					throw new Error('Something happened 1');
				}
			},
			{
				name: 'plugin2',
				renderChunk() {
					throw new Error('Something happened 2');
				}
			}
		]
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		plugin: 'plugin1',
		hook: 'renderChunk',
		message: `Something happened 1`
	}
});
