module.exports = defineTest({
	description: 'prefixes global names with `global.` when creating UMD bundle (#57)',
	expectedWarnings: ['UNUSED_EXTERNAL_IMPORT'],
	options: {
		external: ['factory', 'baz', 'shipping-port', 'alphabet'],
		output: {
			globals: {
				alphabet: 'alphabet',
				baz: 'baz',
				factory: 'factory',
				'shipping-port': 'containers'
			}
		}
	}
});
