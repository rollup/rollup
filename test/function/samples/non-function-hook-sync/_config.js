module.exports = defineTest({
	description: 'throws when providing a value for a sync function hook',
	options: {
		plugins: [
			{
				outputOptions: 'value'
			}
		]
	},
	generateError: {
		code: 'INVALID_PLUGIN_HOOK',
		hook: 'outputOptions',
		message:
			'[plugin at position 1] Error running plugin hook "outputOptions" for plugin "at position 1", expected a function hook or an object with a "handler" function.',
		plugin: 'at position 1'
	}
});
