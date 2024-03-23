const path = require('node:path');

module.exports = defineTest({
	description: '`this.warn(...)` accepts { line, column } object as second parameter (#1265)',
	options: {
		plugins: [
			{
				name: 'test',
				transform() {
					this.warn('foo', { line: 1, column: 22 });
					return 'assert.equal( 21 * 2, 42 );';
				}
			}
		]
	},
	warnings: [
		{
			code: 'PLUGIN_WARNING',
			id: path.join(__dirname, 'main.js'),
			plugin: 'test',
			hook: 'transform',
			message: '[plugin test] main.js (1:22): foo',
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
	]
});
