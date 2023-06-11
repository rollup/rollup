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
		assert.deepStrictEqual(logs, [
			['onLog', 'warn', { message: 'warnLog' }],
			['warn', 'warnLog'],
			[
				'onLog',
				'warn',
				{ message: 'warnLog', plugin: 'fooPlugin', loc: { file: 'fooFile', line: 1, column: 2 } }
			],
			['warn', '(fooPlugin plugin) fooFile (1:2) warnLog'],
			['onLog', 'warn', { message: 'warnLog-' }],
			['onLog', 'warn', { message: 'warnLog+-' }],
			['debug', 'log was replaced'],
			['onLog', 'warn', { message: 'warnLog*-' }],
			['info', 'log was replaced with string'],
			['onLog', 'info', { message: 'infoLog' }],
			['info', 'infoLog'],
			['onLog', 'debug', { message: 'debugLog' }],
			['debug', 'debugLog'],
			['onLog', 'warn', { message: 'warnWarn' }],
			['warn', 'warnWarn'],
			['onLog', 'warn', { message: 'warnWarn-' }],
			['onLog', 'warn', { message: 'warnWarn+-' }],
			['debug', 'log was replaced'],
			['onLog', 'warn', { message: 'warnWarn*-' }],
			['info', 'log was replaced with string']
		]);
		assert.strictEqual(logs[0][2].toString(), 'warnLog');
		assert.strictEqual(logs[2][2].toString(), '(fooPlugin plugin) fooFile (1:2) warnLog');
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
					options.onwarn({ message: 'warnWarn' });
					options.onwarn({ message: 'warnWarn-' });
					options.onwarn({ message: 'warnWarn+-' });
					options.onwarn({ message: 'warnWarn*-' });
				}
			}
		]
	}
});
