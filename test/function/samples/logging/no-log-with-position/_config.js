module.exports = defineTest({
	// solo: true,
	description: 'does not support passing a position to this.log outside the transform hook',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.log('log-message1', { pos: 20 });
				}
			}
		]
	},
	logs: [
		{
			code: 'INVALID_LOG_POSITION',
			message:
				'Plugin "test" tried to add a file position to a log or warning. This is only supported in the "transform" hook at the moment and will be ignored.',
			level: 'warn'
		},
		{
			message: 'log-message1',
			code: 'PLUGIN_LOG',
			plugin: 'test',
			level: 'info'
		}
	]
});
