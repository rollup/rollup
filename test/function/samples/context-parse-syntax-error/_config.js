module.exports = defineTest({
	description: 'handles syntax errors when using this.parse',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.parse(`<=>`);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'Expression expected',
		plugin: 'test',
		pluginCode: 'PARSE_ERROR',
		pos: 0
	}
});
