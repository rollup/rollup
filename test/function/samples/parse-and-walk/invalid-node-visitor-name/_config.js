const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'parseAndWalk should throw error when specifying invalid node visitor name',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async transform() {
					await this.parseAndWalk('const x = 1;', {
						InvalidNodeType() {
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
		message: 'Unknown node type "InvalidNodeType" when calling "parseAndWalk".',
		plugin: 'test-plugin',
		watchFiles: [ID_MAIN]
	}
});
