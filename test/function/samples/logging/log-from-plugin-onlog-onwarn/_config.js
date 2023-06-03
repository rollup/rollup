const assert = require('node:assert');
const { debug, info, warn } = console;
const logs = [];

module.exports = defineTest({
	description: 'passes logs from plugins to onLog and onwarn',
	before() {
		console.debug = (...log) => logs.push(['debug', ...log]);
		console.info = (...log) => logs.push(['info', ...log]);
		console.warn = (...log) => logs.push(['warn', ...log]);
	},
	after() {
		Object.assign(console, { debug, info, warn });
		assert.deepStrictEqual(logs, [
			[
				'onLog',
				'warn',
				{
					message: 'warnLog',
					code: 'PLUGIN_WARNING',
					binding: 'foo',
					pluginCode: 'EXTRA_CODE',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'warn',
				{
					message: 'warnLog',
					code: 'PLUGIN_WARNING',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'warn',
				{
					message: 'warnString',
					code: 'PLUGIN_WARNING',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'info',
				{
					message: 'infoLog',
					code: 'PLUGIN_LOG',
					binding: 'foo',
					pluginCode: 'EXTRA_CODE',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'info',
				{
					message: 'infoString',
					code: 'PLUGIN_LOG',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'debug',
				{
					message: 'debugLog',
					code: 'PLUGIN_LOG',
					binding: 'foo',
					pluginCode: 'EXTRA_CODE',
					plugin: 'test'
				}
			],
			[
				'onLog',
				'debug',
				{
					message: 'debugString',
					code: 'PLUGIN_LOG',
					plugin: 'test'
				}
			]
		]);
	},
	options: {
		logLevel: 'debug',
		onwarn(warning) {
			logs.push(['onwarn', warning]);
		},
		onLog(level, log) {
			logs.push(['onLog', level, log]);
		},
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.warn({ message: 'warnLog', code: 'EXTRA_CODE', binding: 'foo' });
					this.warn({ message: 'warnLog' });
					this.warn('warnString');
					this.info({ message: 'infoLog', code: 'EXTRA_CODE', binding: 'foo' });
					this.info('infoString');
					this.debug({ message: 'debugLog', code: 'EXTRA_CODE', binding: 'foo' });
					this.debug('debugString');
				}
			}
		]
	}
});
