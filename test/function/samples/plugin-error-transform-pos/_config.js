const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: '`this.error(...)` accepts number as second parameter (#5044)',
	options: {
		plugins: [
			{
				name: 'plugin1',
				transform(code) {
					return code + 'bar';
				}
			},
			{
				name: 'plugin2',
				transform() {
					this.error(new Error('error'), 26);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		message: 'error',
		plugin: 'plugin2',
		hook: 'transform',
		id: ID_MAIN,
		watchFiles: [ID_MAIN],
		frame: `
			1: export const foo = 'foo'bar
			                             ^`,
		loc: {
			column: 26,
			file: ID_MAIN,
			line: 1
		},
		pos: 26
	}
});
