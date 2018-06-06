module.exports = {
	description: 'simple chunking',
	options: {
    input: ['main.js'],
    plugins: {
      transform (code, id) {
        const assetId = this.emitAsset('test.ext', 'hello world');
        return `export default import.meta.ROLLUP_ASSET_URL_${assetId};`;
      }
    }
	}
};
