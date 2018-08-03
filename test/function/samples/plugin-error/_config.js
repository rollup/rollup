const path = require('path');

module.exports = {
	description: 'plugin transform hooks can use `this.error({...}, char)` (#1140)',
	options: {
		plugins: [
			{
				name: 'test',
				transform(code, id) {
					this.error('nope', 22);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		plugin: 'test',
		message: 'nope',
		hook: 'transform',
		id: path.resolve(__dirname, 'main.js'),
		pos: 22,
		loc: {
			file: path.resolve(__dirname, 'main.js'),
			line: 1,
			column: 22
		},
		frame: `
			1: assert.equal( 21 * 2, TK );
			                         ^
		`
	}
};
