module.exports = {
	description: 'throws when providing a value for a sync function hook',
	options: {
		plugins: {
			outputOptions: 'value'
		}
	},
	generateError: {
		code: 'PLUGIN_ERROR',
		hook: 'outputOptions',
		message: 'Error running plugin hook outputOptions for at position 1, expected a function hook.',
		plugin: 'at position 1',
		pluginCode: 'INVALID_PLUGIN_HOOK'
	}
};
