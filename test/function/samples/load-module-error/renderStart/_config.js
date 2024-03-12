module.exports = defineTest({
	description: 'renderStart hooks can use this.error',
	options: {
		plugins: [
			{
				name: 'test',
				renderStart() {
					this.error('nope');
				}
			}
		]
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		plugin: 'test',
		message: '[plugin test] nope',
		hook: 'renderStart'
	}
});
