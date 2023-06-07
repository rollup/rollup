const assert = require('node:assert');

const logs = [];

module.exports = defineTest({
	description: 'allows to order plugins when logging',
	options: {
		logLevel: 'debug',
		plugins: [
			{
				name: 'first',
				buildStart() {
					this.info('first');
					this.info('second');
					this.info('third');
				},
				onLog(level, log) {
					logs.push(['first', level, log]);
					if (log.message === 'first') {
						return false;
					}
				}
			},
			{
				name: 'second',
				onLog: {
					order: 'pre',
					handler(level, log) {
						logs.push(['second', level, log]);
						if (log.message === 'second') {
							return false;
						}
					}
				}
			},
			{
				name: 'third',
				onLog: {
					order: 'post',
					handler(level, log) {
						logs.push(['third', level, log]);
						if (log.message === 'third') {
							return false;
						}
					}
				}
			}
		]
	},
	after() {
		assert.deepStrictEqual(logs, [
			['second', 'info', { message: 'first', code: 'PLUGIN_LOG', plugin: 'first' }],
			['first', 'info', { message: 'first', code: 'PLUGIN_LOG', plugin: 'first' }],
			['second', 'info', { message: 'second', code: 'PLUGIN_LOG', plugin: 'first' }],
			['second', 'info', { message: 'third', code: 'PLUGIN_LOG', plugin: 'first' }],
			['first', 'info', { message: 'third', code: 'PLUGIN_LOG', plugin: 'first' }],
			['third', 'info', { message: 'third', code: 'PLUGIN_LOG', plugin: 'first' }]
		]);
	},
	logs: []
});
