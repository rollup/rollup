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
			['onLog', 'warn', { message: 'warnLog' }],
			['onwarn', { message: 'warnLog' }],
			['warn', 'warnLog'],
			[
				'onLog',
				'warn',
				{ message: 'warnLog', plugin: 'fooPlugin', loc: { file: 'fooFile', line: 1, column: 2 } }
			],
			[
				'onwarn',
				{ message: 'warnLog', plugin: 'fooPlugin', loc: { file: 'fooFile', line: 1, column: 2 } }
			],
			['warn', '(fooPlugin plugin) fooFile (1:2) warnLog'],
			['onLog', 'warn', { message: 'warnLog=' }],
			['onwarn', { message: 'warnLog=' }],
			['onLog', 'warn', { message: 'warnLog+=' }],
			['onwarn', { message: 'warnLog+=' }],
			['warn', 'log was replaced'],
			['onLog', 'warn', { message: 'warnLog-' }],
			['onLog', 'warn', { message: 'warnLog+-' }],
			['info', 'log was replaced'],
			['onLog', 'info', { message: 'infoLog' }],
			['info', 'infoLog'],
			['onLog', 'debug', { message: 'debugLog' }],
			['debug', 'debugLog'],
			['onLog', 'warn', { message: 'warnWarn' }],
			['onwarn', { message: 'warnWarn' }],
			['warn', 'warnWarn'],
			['onLog', 'warn', { message: 'warnWarn=' }],
			['onwarn', { message: 'warnWarn=' }],
			['onLog', 'warn', { message: 'warnWarn+=' }],
			['onwarn', { message: 'warnWarn+=' }],
			['warn', 'log was replaced'],
			['onLog', 'warn', { message: 'warnWarn-' }],
			['onLog', 'warn', { message: 'warnWarn+-' }],
			['info', 'log was replaced']
		]);
		assert.strictEqual(logs[0][2].toString(), 'warnLog');
		assert.strictEqual(logs[1][1].toString(), 'warnLog');
		assert.strictEqual(logs[3][2].toString(), '(fooPlugin plugin) fooFile (1:2) warnLog');
		assert.strictEqual(logs[4][1].toString(), '(fooPlugin plugin) fooFile (1:2) warnLog');
	},
	options: {
		logLevel: 'debug',
		onwarn(warning, handler) {
			logs.push(['onwarn', warning]);
			if (!warning.message.endsWith('=')) {
				handler(warning);
			} else if (warning.message.endsWith('+=')) {
				handler({ message: 'log was replaced' });
			}
		},
		onLog(level, log, handler) {
			logs.push(['onLog', level, log]);
			if (!log.message.endsWith('-')) {
				handler(level, log);
			} else if (log.message.endsWith('+-')) {
				handler('info', { message: 'log was replaced' });
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
					options.onLog('warn', { message: 'warnLog=' });
					options.onLog('warn', { message: 'warnLog+=' });
					options.onLog('warn', { message: 'warnLog-' });
					options.onLog('warn', { message: 'warnLog+-' });
					options.onLog('info', { message: 'infoLog' });
					options.onLog('debug', { message: 'debugLog' });
					options.onwarn({ message: 'warnWarn' });
					options.onwarn({ message: 'warnWarn=' });
					options.onwarn({ message: 'warnWarn+=' });
					options.onwarn({ message: 'warnWarn-' });
					options.onwarn({ message: 'warnWarn+-' });
				}
			}
		]
	}
});
