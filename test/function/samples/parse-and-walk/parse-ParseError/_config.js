const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'parseAndWalk should throw PARSE_ERROR on invalid syntax',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform() {
					await this.parseAndWalk('const x = ;', {
						Identifier() {
							// Should not reach here
						}
					});
					return null;
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'transform',
		id: ID_MAIN,
		message: 'Expression expected',
		plugin: 'test-plugin',
		pluginCode: 'PARSE_ERROR',
		pos: 10,
		watchFiles: [ID_MAIN]
	}
});
