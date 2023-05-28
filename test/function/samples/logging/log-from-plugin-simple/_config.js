const assert = require('node:assert');
const { debug, info, warn } = console;
const logs = [];

module.exports = defineTest({
	// solo: true,
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
			['info', '(test plugin) infoLog'],
			['debug', '(test plugin) debugLog'],
			['info', '(test plugin) stringLog'],
			['warn', '(test plugin) warnWarn'],
			['warn', '(test plugin) stringWarn']
		]);
	},
	options: {
		onwarn: null,
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
