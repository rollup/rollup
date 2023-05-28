const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	// solo: true,
	description: 'allows passing a position to this.log in the transform hook',
	options: {
		plugins: [
			{
				name: 'test',
				transform() {
					this.log('log-message1', { pos: 20 });
					this.log('log-message2', { pos: { line: 2, column: 1 } });
					this.log(
						{ message: 'log-message3', pos: { line: 2, column: 2 }, level: 'debug' },
						{ pos: 20 }
					);
					this.warn('warn-message1', 20);
					this.warn('warn-message2', { line: 2, column: 1 });
					this.warn({ message: 'warn-message3', pos: { line: 2, column: 2 } }, 20);
				}
			}
		]
	},
	logs: [
		{
			message: 'log-message1',
			pos: 20,
			loc: {
				column: 3,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: assert.ok(true);
				2: assert.ok(true);
				      ^
				3: assert.ok(true);`,
			id: ID_MAIN,
			hook: 'transform',
			code: 'PLUGIN_LOG',
			plugin: 'test',
			level: 'info'
		},
		{
			message: 'log-message2',
			loc: {
				column: 1,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: assert.ok(true);
				2: assert.ok(true);
				    ^
				3: assert.ok(true);`,
			id: ID_MAIN,
			hook: 'transform',
			code: 'PLUGIN_LOG',
			plugin: 'test',
			level: 'info'
		},
		{
			message: 'log-message3',
			pos: 20,
			level: 'debug',
			loc: {
				column: 3,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: assert.ok(true);
				2: assert.ok(true);
				      ^
				3: assert.ok(true);`,
			id: ID_MAIN,
			hook: 'transform',
			code: 'PLUGIN_LOG',
			plugin: 'test'
		},
		{
			message: 'warn-message1',
			pos: 20,
			loc: {
				column: 3,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: assert.ok(true);
				2: assert.ok(true);
				      ^
				3: assert.ok(true);`,
			id: ID_MAIN,
			hook: 'transform',
			code: 'PLUGIN_WARNING',
			plugin: 'test',
			level: 'warn'
		},
		{
			message: 'warn-message2',
			loc: {
				column: 1,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: assert.ok(true);
				2: assert.ok(true);
				    ^
				3: assert.ok(true);`,
			id: ID_MAIN,
			hook: 'transform',
			code: 'PLUGIN_WARNING',
			plugin: 'test',
			level: 'warn'
		},
		{
			message: 'warn-message3',
			pos: 20,
			loc: {
				column: 3,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: assert.ok(true);
				2: assert.ok(true);
				      ^
				3: assert.ok(true);`,
			id: ID_MAIN,
			hook: 'transform',
			code: 'PLUGIN_WARNING',
			plugin: 'test',
			level: 'warn'
		}
	]
});
