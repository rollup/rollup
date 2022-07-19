module.exports = {
	description: 'throws when providing a value for an async function hook',
	options: {
		plugins: {
			resolveId: 'value'
		}
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'resolveId',
		plugin: 'at position 1',
		pluginCode: 'INVALID_PLUGIN_HOOK',
		message: 'Error running plugin hook "resolveId" for "at position 1", expected a function hook.'
	}
};
