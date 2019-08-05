module.exports = {
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
		message: 'Plugin error creating asset "d59386e0" - no asset source set.'
	}
};
