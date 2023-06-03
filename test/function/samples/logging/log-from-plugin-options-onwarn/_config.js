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
			['onwarn', { message: 'warnLog' }],
			['warn', 'warnLog'],
			[
				'onwarn',
				{ message: 'warnLog', plugin: 'fooPlugin', loc: { file: 'fooFile', line: 1, column: 2 } }
			],
			['warn', '(fooPlugin plugin) fooFile (1:2) warnLog'],
			['onwarn', { message: 'warnLog-' }],
			['onwarn', { message: 'warnLog+-' }],
			['warn', 'log was replaced'],
			['onwarn', { message: 'warnLog*-' }],
			['warn', 'log was replaced with string'],
			['info', 'infoLog'],
			['debug', 'debugLog'],
			['onwarn', { message: 'warnWarn' }],
			['warn', 'warnWarn'],
			['onwarn', { message: 'warnWarn-' }],
			['onwarn', { message: 'warnWarn+-' }],
			['warn', 'log was replaced'],
			['onwarn', { message: 'warnWarn*-' }],
			['warn', 'log was replaced with string']
		]);
		assert.strictEqual(logs[0][1].toString(), 'warnLog');
		assert.strictEqual(logs[2][1].toString(), '(fooPlugin plugin) fooFile (1:2) warnLog');
	},
	options: {
		logLevel: 'debug',
		onwarn(warning, handler) {
			logs.push(['onwarn', warning]);
			if (!warning.message.endsWith('-')) {
				handler(warning);
			} else if (warning.message.endsWith('+-')) {
				handler({ message: 'log was replaced' });
			} else if (warning.message.endsWith('*-')) {
				handler('log was replaced with string');
			}
		},
		onLog: null,
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
