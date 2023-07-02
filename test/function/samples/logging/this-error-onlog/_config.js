module.exports = defineTest({
	description: 'can turn logs into errors via this.error in the onLog hook',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.warn({ message: 'test log', code: 'THE_CODE' });
				},
				onLog(level, log) {
					this.error(log);
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'buildStart',
		message: 'test log',
		plugin: 'test',
		pluginCode: 'THE_CODE'
	}
});
