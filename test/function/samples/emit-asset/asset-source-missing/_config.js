module.exports = {
	description: 'throws when not setting the asset source',
	options: {
		plugins: {
			name: 'test-plugin',
			load() {
				this.emitAsset('test.ext');
			}
		}
	},
	generateError: {
		code: 'ASSET_SOURCE_NOT_FOUND',
		message: 'Plugin error creating asset "test.ext" - no asset source set.'
	}
};
