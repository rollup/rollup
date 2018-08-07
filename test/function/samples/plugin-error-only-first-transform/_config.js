const path = require('path');

module.exports = {
	description: 'throws error only with first plugin transform',
	options: {
		plugins: [
			{
				name: 'plugin1',
				transform() {
					throw Error('Something happened 1');
				}
			},
			{
				name: 'plugin2',
				transform() {
					throw Error('Something happened 2');
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		message: `Something happened 1`,
		plugin: 'plugin1',
		id: path.resolve(__dirname, 'main.js')
	}
};
