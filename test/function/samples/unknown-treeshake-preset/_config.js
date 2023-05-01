module.exports = defineTest({
	description: 'throws for unknown presets for the treeshake option',
	options: {
		treeshake: {
			// @ts-expect-error expected error
			preset: 'some-string'
		}
	},
	error: {
		code: 'INVALID_OPTION',
		message:
			'Invalid value "some-string" for option "treeshake.preset" - valid values are "recommended", "safest" and "smallest".',
		url: 'https://rollupjs.org/configuration-options/#treeshake'
	}
});
