const path = require('node:path');

module.exports = defineTest({
	description: 'throws error only with first plugin transform',
	options: {
		plugins: [
			{
				name: 'plugin1',
				transform() {
					throw new Error('Something happened 1');
				}
			},
			{
				name: 'plugin2',
				transform() {
					throw new Error('Something happened 2');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		message: `Something happened 1`,
		plugin: 'plugin1',
		hook: 'transform',
		id: path.join(__dirname, 'main.js'),
		watchFiles: [path.join(__dirname, 'main.js')]
	}
});
