module.exports = {
	description: 'supports emitting assets in a hacky way by editing the bundle object',
	expectedWarnings: ['DEPRECATED_FEATURE'],
	options: {
		strictDeprecations: false,
		plugins: {
			generateBundle(options, outputBundle) {
				const file = {
					fileName: 'my-hacky-asset.txt',
					isAsset: true,
					source: 'My Hacky Source'
				};
				outputBundle[file.fileName] = file;
			}
		}
	}
};
