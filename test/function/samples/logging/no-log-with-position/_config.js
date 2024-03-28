module.exports = defineTest({
	description:
		'does not support passing a position to this.warn/info/debug outside the transform hook',
	options: {
		logLevel: 'debug',
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.warn('log-message1', 20);
					this.warn('log-message1', { line: 2, column: 1 });
					this.info('log-message1', 20);
					this.info('log-message1', { line: 2, column: 1 });
					this.debug('log-message1', 20);
					this.debug('log-message1', { line: 2, column: 1 });
				}
			}
		]
	},
	logs: [
		{
			level: 'warn',
			code: 'INVALID_LOG_POSITION',
			message:
				'Plugin "test" tried to add a file position to a log or warning. This is only supported in the "transform" hook at the moment and will be ignored.'
		},
		{
			level: 'warn',
			code: 'INVALID_LOG_POSITION',
			message:
				'Plugin "test" tried to add a file position to a log or warning. This is only supported in the "transform" hook at the moment and will be ignored.'
		},
		{
			level: 'warn',
			code: 'INVALID_LOG_POSITION',
			message:
				'Plugin "test" tried to add a file position to a log or warning. This is only supported in the "transform" hook at the moment and will be ignored.'
		},
		{
			level: 'warn',
			code: 'INVALID_LOG_POSITION',
			message:
				'Plugin "test" tried to add a file position to a log or warning. This is only supported in the "transform" hook at the moment and will be ignored.'
		},
		{
			level: 'warn',
			code: 'INVALID_LOG_POSITION',
			message:
				'Plugin "test" tried to add a file position to a log or warning. This is only supported in the "transform" hook at the moment and will be ignored.'
		},
		{
			level: 'warn',
			code: 'INVALID_LOG_POSITION',
			message:
				'Plugin "test" tried to add a file position to a log or warning. This is only supported in the "transform" hook at the moment and will be ignored.'
		},
		{
			level: 'warn',
			message: '[plugin test] log-message1',
			code: 'PLUGIN_WARNING',
			plugin: 'test'
		},
		{
			level: 'warn',
			message: '[plugin test] log-message1',
			code: 'PLUGIN_WARNING',
			plugin: 'test'
		},
		{ level: 'info', message: '[plugin test] log-message1', code: 'PLUGIN_LOG', plugin: 'test' },
		{ level: 'info', message: '[plugin test] log-message1', code: 'PLUGIN_LOG', plugin: 'test' },
		{ level: 'debug', message: '[plugin test] log-message1', code: 'PLUGIN_LOG', plugin: 'test' },
		{ level: 'debug', message: '[plugin test] log-message1', code: 'PLUGIN_LOG', plugin: 'test' }
	]
});
