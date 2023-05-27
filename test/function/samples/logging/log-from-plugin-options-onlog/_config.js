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
			['onLog', { level: 'warn', message: 'warnLog' }],
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
			['warn', '(fooPlugin plugin) fooFile (1:2) warnLog'],
			['onLog', { level: 'warn', message: 'warnLog-' }],
			['onLog', { level: 'warn', message: 'warnLog+-' }],
			['debug', 'log was replaced'],
			['onLog', { level: 'warn', message: 'warnLog*-' }],
			['info', 'log was replaced with string'],
			['onLog', { level: 'info', message: 'infoLog' }],
			['info', 'infoLog'],
			['onLog', { level: 'debug', message: 'debugLog' }],
			['debug', 'debugLog'],
			['onLog', { message: 'warnWarn', level: 'warn' }],
			['warn', 'warnWarn'],
			['onLog', { message: 'warnWarn-', level: 'warn' }],
			['onLog', { message: 'warnWarn+-', level: 'warn' }],
			['debug', 'log was replaced'],
			['onLog', { message: 'warnWarn*-', level: 'warn' }],
			['info', 'log was replaced with string']
		]);
		assert.strictEqual(logs[0][1].toString(), 'warnLog');
		assert.strictEqual(logs[2][1].toString(), '(fooPlugin plugin) fooFile (1:2) warnLog');
	},
	options: {
		onwarn: null,
		onLog(log, handler) {
			logs.push(['onLog', log]);
			if (!log.message.endsWith('-')) {
				handler(log);
			} else if (log.message.endsWith('+-')) {
				handler({ level: 'debug', message: 'log was replaced' });
			} else if (log.message.endsWith('*-')) {
				handler('log was replaced with string');
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
					options.onLog({ level: 'warn', message: 'warnLog-' });
					options.onLog({ level: 'warn', message: 'warnLog+-' });
					options.onLog({ level: 'warn', message: 'warnLog*-' });
					options.onLog({ level: 'info', message: 'infoLog' });
					options.onLog({ level: 'debug', message: 'debugLog' });
					options.onwarn({ message: 'warnWarn' });
					options.onwarn({ message: 'warnWarn-' });
					options.onwarn({ message: 'warnWarn+-' });
					options.onwarn({ message: 'warnWarn*-' });
				}
			}
		]
	}
});
