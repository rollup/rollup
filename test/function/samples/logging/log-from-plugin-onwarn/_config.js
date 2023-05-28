const assert = require('node:assert');
const { debug, info, warn } = console;
const logs = [];

module.exports = defineTest({
	// solo: true,
	description: 'passes warn logs from plugins to onwarn',
	before() {
		console.debug = (...log) => logs.push(['debug', ...log]);
		console.info = (...log) => logs.push(['info', ...log]);
		console.warn = (...log) => logs.push(['warn', ...log]);
	},
	after() {
		Object.assign(console, { debug, info, warn });
		assert.deepStrictEqual(logs, [
			[
				'onwarn',
				{
					level: 'warn',
					message: 'warnLog',
					code: 'PLUGIN_LOG',
					plugin: 'test',
					pluginCode: 'EXTRA_CODE'
				}
			],
			['info', '(test plugin) infoLog'],
			['debug', '(test plugin) debugLog'],
			['info', '(test plugin) stringLog'],
			[
				'onwarn',
				{ message: 'warnWarn', code: 'PLUGIN_WARNING', plugin: 'test', pluginCode: 'EXTRA_CODE' }
			],
			['onwarn', { message: 'stringWarn', code: 'PLUGIN_WARNING', plugin: 'test' }]
		]);
	},
	options: {
		onwarn(warning) {
			logs.push(['onwarn', warning]);
		},
		onLog: null,
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
