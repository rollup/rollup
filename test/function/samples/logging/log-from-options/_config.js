module.exports = defineTest({
	description: 'can log from the options hook',
	options: {
		logLevel: 'debug',
		plugins: [
			{
				name: 'test',
				options() {
					this.debug('debug');
					this.info('info');
					this.warn('warn');
					this.error('error');
				}
			}
		]
	},
	logs: [
		{ level: 'debug', message: 'debug', code: 'PLUGIN_LOG', plugin: 'test' },
		{ level: 'info', message: 'info', code: 'PLUGIN_LOG', plugin: 'test' },
		{ level: 'warn', message: 'warn', code: 'PLUGIN_WARNING', plugin: 'test' }
	],
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'onLog',
		message: 'error',
		plugin: 'test'
	}
});
