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
			['onLog', 'warn', { message: 'warnLog' }],
			['warn', 'warnLog'],
			[
				'onLog',
				'warn',
				{
					message: '[plugin fooPlugin] fooFile (1:2): warnLog',
					plugin: 'fooPlugin',
					loc: { file: 'fooFile', line: 1, column: 2 }
				}
			],
			['warn', '[plugin fooPlugin] fooFile (1:2): warnLog'],
			['onLog', 'warn', { message: 'warnLog-' }],
			['onLog', 'warn', { message: 'warnLog+-' }],
			['debug', 'log was replaced'],
			['onLog', 'warn', { message: 'warnLog*-' }],
			['info', 'log was replaced with string'],
			['onLog', 'info', { message: 'infoLog' }],
			['info', 'infoLog'],
			['onLog', 'debug', { message: 'debugLog' }],
			['debug', 'debugLog']
		]);
		assert.strictEqual(logs[0][2].toString(), 'warnLog');
		assert.strictEqual(logs[2][2].toString(), '[plugin fooPlugin] fooFile (1:2): warnLog');
	},
	options: {
		logLevel: 'debug',
		onwarn: null,
		onLog(level, log, handler) {
			logs.push(['onLog', level, log]);
			if (!log.message.endsWith('-')) {
				handler(level, log);
			} else if (log.message.endsWith('+-')) {
				handler('debug', { message: 'log was replaced' });
			} else if (log.message.endsWith('*-')) {
				handler('info', 'log was replaced with string');
			}
		},
		plugins: [
			{
				name: 'test',
				buildStart(options) {
					options.onLog('warn', { message: 'warnLog' });
					options.onLog('warn', {
						message: 'warnLog',
						plugin: 'fooPlugin',
						loc: { file: 'fooFile', line: 1, column: 2 }
					});
					options.onLog('warn', { message: 'warnLog-' });
					options.onLog('warn', { message: 'warnLog+-' });
					options.onLog('warn', { message: 'warnLog*-' });
					options.onLog('info', { message: 'infoLog' });
					options.onLog('debug', { message: 'debugLog' });
				}
			}
		]
	}
});
