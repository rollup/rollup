const path = require('path');

module.exports = {
	description: '`this.warn(...)` accepts { line, column } object as second parameter (#1265)',
	options: {
		plugins: [
			{
				name: 'test',
				transform(code, id) {
					this.warn('foo', { line: 1, column: 22 });
					return 'assert.equal( 21 * 2, 42 );';
				}
			}
		]
	},
	warnings: [
		{
			code: 'PLUGIN_WARNING',
			id: path.resolve(__dirname, 'main.js'),
			plugin: 'test',
			hook: 'transform',
			message: 'foo',
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
	]
};
