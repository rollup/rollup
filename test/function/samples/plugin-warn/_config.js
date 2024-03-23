const path = require('node:path');

module.exports = defineTest({
	description: 'plugin transform hooks can use `this.warn({...}, char)` (#1140)',
	options: {
		plugins: [
			{
				name: 'test',
				transform() {
					this.warn({ message: 'foo', code: 'CODE' });
					this.warn('bar', 22);
					return 'assert.equal( 21 * 2, 42 );';
				}
			}
		]
	},
	warnings: [
		{
			code: 'PLUGIN_WARNING',
			id: path.join(__dirname, 'main.js'),
			hook: 'transform',
			plugin: 'test',
			message: '[plugin test] main.js: foo',
			pluginCode: 'CODE'
		},
		{
			code: 'PLUGIN_WARNING',
			id: path.join(__dirname, 'main.js'),
			plugin: 'test',
			hook: 'transform',
			message: '[plugin test] main.js (1:22): bar',
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
	]
});
