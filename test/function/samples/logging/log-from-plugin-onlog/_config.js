const assert = require('node:assert');
const { debug, info, warn } = console;
const logs = [];

module.exports = defineTest({
	description: 'passes logs from plugins to onLog',
	before() {
		console.debug = (...log) => logs.push(['debug', ...log]);
		console.info = (...log) => logs.push(['info', ...log]);
		console.warn = (...log) => logs.push(['warn', ...log]);
	},
	after() {
		Object.assign(console, { debug, info, warn });
		assert.deepEqual(logs, [
			[
				'onLog',
				'warn',
				{
					message: '[plugin test] warnLog',
					pluginCode: 'PLUGIN_CODE',
					binding: 'foo',
					code: 'PLUGIN_WARNING',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'warn',
				{ message: '[plugin test] warnString', code: 'PLUGIN_WARNING', plugin: 'test' }
			],
			[
				'onLog',
				'info',
				{
					message: '[plugin test] infoLog',
					pluginCode: 'PLUGIN_CODE',
					binding: 'foo',
					code: 'PLUGIN_LOG',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'info',
				{ message: '[plugin test] infoString', code: 'PLUGIN_LOG', plugin: 'test' }
			],
			[
				'onLog',
				'debug',
				{
					message: '[plugin test] debugLog',
					pluginCode: 'PLUGIN_CODE',
					binding: 'foo',
					code: 'PLUGIN_LOG',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'debug',
				{ message: '[plugin test] debugString', code: 'PLUGIN_LOG', plugin: 'test' }
			]
		]);
	},
	options: {
		logLevel: 'debug',
		onwarn: null,
		onLog(level, log) {
			logs.push(['onLog', level, log]);
		},
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.warn({ message: 'warnLog', pluginCode: 'PLUGIN_CODE', binding: 'foo' });
					this.warn('warnString');
					this.info({ message: 'infoLog', pluginCode: 'PLUGIN_CODE', binding: 'foo' });
					this.info('infoString');
					this.debug({ message: 'debugLog', pluginCode: 'PLUGIN_CODE', binding: 'foo' });
					this.debug('debugString');
				}
			}
		]
	}
});
