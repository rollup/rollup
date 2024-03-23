const assert = require('node:assert');
const { debug, info, warn } = console;
const logs = [];

module.exports = defineTest({
	description: 'allows turning logs into errors',
	before() {
		console.debug = (...log) => logs.push(['debug', ...log]);
		console.info = (...log) => logs.push(['info', ...log]);
		console.warn = (...log) => logs.push(['warn', ...log]);
	},
	after() {
		Object.assign(console, { debug, info, warn });
		assert.deepEqual(logs, []);
	},
	options: {
		onwarn: null,
		onLog(_level, log, handler) {
			handler('error', log);
		},
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.info({ message: 'info becomes error', code: 'EXTRA_CODE', binding: 'foo' });
				}
			}
		]
	},
	error: {
		binding: 'foo',
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: '[plugin test] info becomes error',
		plugin: 'test',
		pluginCode: 'EXTRA_CODE'
	}
});
