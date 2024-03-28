module.exports = defineTest({
	description: 'throws when providing a non-string value for an addon hook',
	options: {
		plugins: [{ intro: 42 }]
	},
	generateError: {
		code: 'ADDON_ERROR',
		message:
			'Could not retrieve "intro". Check configuration of plugin "at position 1".\n\tError Message: [plugin at position 1] Error running plugin hook "intro" for plugin "at position 1", expected a string, a function hook or an object with a "handler" string or function.'
	}
});
