module.exports = defineTest({
	description: 'throws when not setting the asset source',
	options: {
		plugins: {
			name: 'test-plugin',
			load() {
				this.emitFile({ type: 'asset' });
			}
		}
	},
	generateError: {
		code: 'ASSET_SOURCE_MISSING',
		message: 'Plugin error creating asset "6b86b273" - no asset source set.'
	}
});
