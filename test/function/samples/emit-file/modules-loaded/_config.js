module.exports = defineTest({
	description: 'Throws when adding a chunk after the modules have finished loading',
	options: {
		input: 'main.js',
		plugins: [
			{
				name: 'test-plugin',
				buildEnd() {
					this.emitFile({ type: 'chunk', id: 'chunk.js' });
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildEnd',
		message: 'Cannot emit chunks after module loading has finished.',
		plugin: 'test-plugin',
		pluginCode: 'INVALID_ROLLUP_PHASE'
	}
});
