module.exports = defineTest({
	description: 'throws when providing a value for an async function hook',
	options: {
		plugins: [{ resolveId: 'value' }]
	},
	error: {
		code: 'INVALID_PLUGIN_HOOK',
		hook: 'resolveId',
		message:
			'[plugin at position 1] Error running plugin hook "resolveId" for plugin "at position 1", expected a function hook or an object with a "handler" function.',
		plugin: 'at position 1'
	}
});
