module.exports = {
	description: 'throws when not setting the asset source',
	options: {
		strictDeprecations: false,
		plugins: {
			name: 'test-plugin',
			load() {
				this.emitAsset('test.ext');
			}
		}
	},
	generateError: {
		code: 'ASSET_SOURCE_MISSING',
		message: 'Plugin error creating asset "test.ext" - no asset source set.'
	}
};
