module.exports = defineTest({
	description: 'can log from the options hook',
	options: {
		plugins: [
			{
				name: 'test',
				options() {
					this.debug('debug');
					this.info('info');
					this.warn('warn');
				}
			}
		]
	},
	logs: [
		{ level: 'debug', message: 'debug', code: 'PLUGIN_LOG', plugin: 'test' },
		{ level: 'info', message: 'info', code: 'PLUGIN_LOG', plugin: 'test' },
		{ level: 'warn', message: 'warn', code: 'PLUGIN_WARNING', plugin: 'test' }
	]
});
