const assert = require('node:assert');
const { debug, info, warn } = console;
const logs = [];

module.exports = defineTest({
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
					message: 'warnLog',
					pluginCode: 'PLUGIN_CODE',
					binding: 'foo',
					code: 'PLUGIN_WARNING',
					plugin: 'test'
				}
			],
			['onwarn', { message: 'warnString', code: 'PLUGIN_WARNING', plugin: 'test' }],
			['info', '(test plugin) infoLog'],
			['info', '(test plugin) infoString'],
			['debug', '(test plugin) debugLog'],
			['debug', '(test plugin) debugString']
		]);
	},
	options: {
		logLevel: 'debug',
		onwarn(warning) {
			logs.push(['onwarn', warning]);
		},
		onLog: null,
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
