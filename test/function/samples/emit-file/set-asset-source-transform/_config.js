const path = require('node:path');

module.exports = defineTest({
	description: 'throws when setting the asset source in the transform hook',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform(code) {
					const assetId = this.emitFile({ type: 'asset', name: 'test.ext' });
					this.setAssetSource(assetId, 'asdf');
					return code;
				}
			}
		]
	},
	error: {
		code: 'PLUGIN_ERROR',
		hook: 'transform',
		id: path.join(__dirname, 'main.js'),
		message:
			'[plugin test-plugin] main.js: setAssetSource cannot be called in transform for caching reasons. Use emitFile with a source, or call setAssetSource in another hook.',
		plugin: 'test-plugin',
		pluginCode: 'INVALID_SETASSETSOURCE',
		watchFiles: [path.join(__dirname, 'main.js')]
	}
});
