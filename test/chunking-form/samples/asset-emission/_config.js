module.exports = {
	description: 'supports emitting assets from plugin hooks',
	options: {
		input: ['main.js'],
		plugins: {
			transform() {
				const assetId = this.emitAsset('test.ext', 'hello world');
				return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
			}
		}
	}
};
