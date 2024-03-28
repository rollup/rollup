const path = require('node:path');

module.exports = defineTest({
	description: 'plugin transform hooks can use `this.error({...}, char)` (#1140)',
	options: {
		plugins: [
			{
				name: 'test',
				transform() {
					this.error('nope', 22);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		plugin: 'test',
		message: '[plugin test] main.js (1:22): nope',
		hook: 'transform',
		id: path.join(__dirname, 'main.js'),
		watchFiles: [path.join(__dirname, 'main.js')],
		pos: 22,
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
