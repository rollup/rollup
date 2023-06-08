const assert = require('node:assert');
const { debug, info, warn } = console;
const logs = [];

module.exports = defineTest({
	description: 'prints logs from plugins via input options if there are no handlers',
	before() {
		console.debug = (...log) => logs.push(['debug', ...log]);
		console.info = (...log) => logs.push(['info', ...log]);
		console.warn = (...log) => logs.push(['warn', ...log]);
	},
	after() {
		Object.assign(console, { debug, info, warn });
		assert.deepStrictEqual(logs, [
			['warn', '(test plugin) warnLog'],
			['warn', '(test plugin) warnString'],
			['info', '(test plugin) infoLog'],
			['info', '(test plugin) infoString'],
			['debug', '(test plugin) debugLog'],
			['debug', '(test plugin) debugString']
		]);
	},
	options: {
		logLevel: 'debug',
		onwarn: null,
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
