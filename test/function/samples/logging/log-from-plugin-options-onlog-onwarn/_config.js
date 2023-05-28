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
			['onLog', { level: 'warn', message: 'warnLog' }],
			['onwarn', { level: 'warn', message: 'warnLog' }],
			['warn', 'warnLog'],
			[
				'onLog',
				{
					level: 'warn',
					message: 'warnLog',
					plugin: 'fooPlugin',
					loc: { file: 'fooFile', line: 1, column: 2 }
				}
			],
			[
				'onwarn',
				{
					level: 'warn',
					message: 'warnLog',
					plugin: 'fooPlugin',
					loc: { file: 'fooFile', line: 1, column: 2 }
				}
			],
			['warn', '(fooPlugin plugin) fooFile (1:2) warnLog'],
			['onLog', { level: 'warn', message: 'warnLog=' }],
			['onwarn', { level: 'warn', message: 'warnLog=' }],
			['onLog', { level: 'warn', message: 'warnLog+=' }],
			['onwarn', { level: 'warn', message: 'warnLog+=' }],
			['warn', 'log was replaced'],
			['onLog', { level: 'warn', message: 'warnLog-' }],
			['onLog', { level: 'warn', message: 'warnLog+-' }],
			['info', 'log was replaced'],
			['onLog', { level: 'info', message: 'infoLog' }],
			['info', 'infoLog'],
			['onLog', { level: 'debug', message: 'debugLog' }],
			['debug', 'debugLog'],
			['onLog', { message: 'warnWarn', level: 'warn' }],
			['onwarn', { message: 'warnWarn', level: 'warn' }],
			['warn', 'warnWarn'],
			['onLog', { message: 'warnWarn=', level: 'warn' }],
			['onwarn', { message: 'warnWarn=', level: 'warn' }],
			['onLog', { message: 'warnWarn+=', level: 'warn' }],
			['onwarn', { message: 'warnWarn+=', level: 'warn' }],
			['warn', 'log was replaced'],
			['onLog', { message: 'warnWarn-', level: 'warn' }],
			['onLog', { message: 'warnWarn+-', level: 'warn' }],
			['info', 'log was replaced']
		]);
		assert.strictEqual(logs[0][1].toString(), 'warnLog');
		assert.strictEqual(logs[1][1].toString(), 'warnLog');
		assert.strictEqual(logs[3][1].toString(), '(fooPlugin plugin) fooFile (1:2) warnLog');
		assert.strictEqual(logs[4][1].toString(), '(fooPlugin plugin) fooFile (1:2) warnLog');
	},
	options: {
		onwarn(warning, handler) {
			logs.push(['onwarn', warning]);
			if (!warning.message.endsWith('=')) {
				handler(warning);
			} else if (warning.message.endsWith('+=')) {
				handler({ message: 'log was replaced' });
			}
		},
		onLog(log, handler) {
			logs.push(['onLog', log]);
			if (!log.message.endsWith('-')) {
				handler(log);
			} else if (log.message.endsWith('+-')) {
				handler({ level: 'info', message: 'log was replaced' });
			}
		},
		plugins: [
			{
				name: 'test',
				buildStart(options) {
					options.onLog({ level: 'warn', message: 'warnLog' });
					options.onLog({
						level: 'warn',
						message: 'warnLog',
						plugin: 'fooPlugin',
						loc: { file: 'fooFile', line: 1, column: 2 }
					});
					options.onLog({ level: 'warn', message: 'warnLog=' });
					options.onLog({ level: 'warn', message: 'warnLog+=' });
					options.onLog({ level: 'warn', message: 'warnLog-' });
					options.onLog({ level: 'warn', message: 'warnLog+-' });
					options.onLog({ level: 'info', message: 'infoLog' });
					options.onLog({ level: 'debug', message: 'debugLog' });
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
