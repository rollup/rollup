const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'allows passing a position to this.warn/info/debug in the transform hook',
	options: {
		logLevel: 'debug',
		plugins: [
			{
				name: 'test',
				transform() {
					this.warn('warn-message1', 20);
					this.warn('warn-message2', { line: 2, column: 1 });
					this.warn({ message: 'warn-message3', pos: { line: 2, column: 2 } }, 20);
					this.info('info-message1', 20);
					this.info('info-message2', { line: 2, column: 1 });
					this.info({ message: 'info-message3', pos: { line: 2, column: 2 } }, 20);
					this.debug('debug-message1', 20);
					this.debug('debug-message2', { line: 2, column: 1 });
					this.debug({ message: 'debug-message3', pos: { line: 2, column: 2 } }, 20);
				}
			}
		]
	},
	logs: [
		{
			level: 'warn',
			message: '[plugin test] main.js (2:3): warn-message1',
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
			plugin: 'test'
		},
		{
			level: 'info',
			message: '[plugin test] main.js (2:3): info-message1',
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
			plugin: 'test'
		},
		{
			level: 'debug',
			message: '[plugin test] main.js (2:3): debug-message1',
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
			plugin: 'test'
		},
		{
			level: 'warn',
			message: '[plugin test] main.js (2:1): warn-message2',
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
			plugin: 'test'
		},
		{
			level: 'info',
			message: '[plugin test] main.js (2:1): info-message2',
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
			plugin: 'test'
		},
		{
			level: 'debug',
			message: '[plugin test] main.js (2:1): debug-message2',
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
			plugin: 'test'
		},
		{
			level: 'warn',
			message: '[plugin test] main.js (2:3): warn-message3',
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
			plugin: 'test'
		},
		{
			level: 'info',
			message: '[plugin test] main.js (2:3): info-message3',
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
			plugin: 'test'
		},
		{
			level: 'debug',
			message: '[plugin test] main.js (2:3): debug-message3',
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
			plugin: 'test'
		}
	]
});
