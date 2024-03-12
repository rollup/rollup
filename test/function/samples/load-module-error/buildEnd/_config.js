module.exports = defineTest({
	description: 'buildEnd hooks can use this.error',
	options: {
		plugins: [
			{
				name: 'test',
				buildEnd() {
					this.error('nope');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		plugin: 'test',
		message: '[plugin test] nope',
		hook: 'buildEnd'
	}
});
