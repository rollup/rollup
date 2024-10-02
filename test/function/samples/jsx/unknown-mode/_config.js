module.exports = defineTest({
	description: 'throws when using an unknown jsx mode',
	options: {
		jsx: {
			mode: 'does-not-exist'
		}
	},
	error: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value "does-not-exist" for option "jsx.mode" - mode must be "automatic", "classic" or "preserve".',
		url: 'https://rollupjs.org/configuration-options/#jsx'
	}
});
