const assert = require('node:assert');

const { debug, info, warn } = console;
const logs = [];
let onLogHookTriggered = false;
let onLogOptionTriggered = false;

module.exports = defineTest({
	description: 'does not show logs for logLevel:silent',
	before() {
		console.debug = (...log) => logs.push(['console-debug', ...log]);
		console.info = (...log) => logs.push(['console-info', ...log]);
		console.warn = (...log) => logs.push(['console-warn', ...log]);
	},
	after() {
		Object.assign(console, { debug, info, warn });
		assert.deepStrictEqual(logs, []);
	},
	options: {
		logLevel: 'silent',
		onLog(level, log, handler) {
			logs.push([level, log]);
			if (!onLogOptionTriggered) {
				onLogOptionTriggered = true;
				handler('debug', 'onLogOption-debug');
				handler('info', 'onLogOption-info');
				handler('warn', 'onLogOption-warn');
			}
		},
		plugins: [
			{
				name: 'test',
				buildStart(options) {
					this.debug('buildStart-debug');
					this.info('buildStart-info');
					this.warn('buildStart-warn');
					options.onLog('debug', { message: 'buildStart-options-debug' });
					options.onLog('info', { message: 'buildStart-options-info' });
					options.onLog('warn', { message: 'buildStart-options-warn' });
				},
				onLog() {
					if (!onLogHookTriggered) {
						onLogHookTriggered = true;
						this.debug('onLog-debug');
						this.info('onLog-info');
						this.warn('onLog-warn');
					}
				},
				options() {
					this.debug('options-debug');
					this.info('options-info');
					this.warn('options-warn');
				},
				transform() {
					this.debug('transform-debug');
					this.info('transform-info');
					this.warn('transform-warn');
				}
			}
		]
	}
});
