const path = require('node:path');

module.exports = defineTest({
	description: '`this.error(...)` accepts { line, column } object as second parameter (#1265)',
	options: {
		plugins: [
			{
				name: 'test',
				transform() {
					this.error('nope', { line: 1, column: 22 });
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		plugin: 'test',
		message: 'nope',
		hook: 'transform',
		id: path.join(__dirname, 'main.js'),
		watchFiles: [path.join(__dirname, 'main.js')],
		loc: {
			file: path.join(__dirname, 'main.js'),
			line: 1,
			column: 22
		},
		frame: `
			1: assert.equal( 21 * 2, TK );
			                         ^
		`
	}
});
