const assert = require('node:assert');
const { debug, info, warn } = console;
const logs = [];

module.exports = defineTest({
	// solo: true,
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
				{
					level: 'warn',
					message: 'warnLog',
					code: 'PLUGIN_LOG',
					pluginCode: 'EXTRA_CODE',
					plugin: 'test'
				}
			],
			['onLog', { level: 'info', message: 'infoLog', code: 'PLUGIN_LOG', plugin: 'test' }],
			['onLog', { level: 'debug', message: 'debugLog', code: 'PLUGIN_LOG', plugin: 'test' }],
			['onLog', { message: 'stringLog', code: 'PLUGIN_LOG', plugin: 'test', level: 'info' }],
			[
				'onLog',
				{
					message: 'warnWarn',
					code: 'PLUGIN_WARNING',
					pluginCode: 'EXTRA_CODE',
					plugin: 'test',
					level: 'warn'
				}
			],
			['onLog', { message: 'stringWarn', code: 'PLUGIN_WARNING', plugin: 'test', level: 'warn' }]
		]);
	},
	options: {
		onwarn(warning) {
			logs.push(['onwarn', warning]);
		},
		onLog(log) {
			logs.push(['onLog', log]);
		},
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.log({ level: 'warn', message: 'warnLog', code: 'EXTRA_CODE' });
					this.log({ level: 'info', message: 'infoLog' });
					this.log({ level: 'debug', message: 'debugLog' });
					this.log('stringLog');
					this.warn({ message: 'warnWarn', code: 'EXTRA_CODE' });
					this.warn('stringWarn');
				}
			}
		]
	}
});
