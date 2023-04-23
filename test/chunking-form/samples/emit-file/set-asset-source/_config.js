let renderStart;
let renderStartNamed;
let banner;
let bannerNamed;
let footer;
let footerNamed;
let intro;
let introNamed;
let outro;
let outroNamed;
let renderChunk;
let renderChunkNamed;
let generateBundle;
let generateBundleNamed;

module.exports = defineTest({
	description: 'supports setting the asset source during generate',
	options: {
		input: ['main.js'],
		plugins: {
			load() {
				renderStart = this.emitFile({ type: 'asset', name: 'renderStart.txt' });
				renderStartNamed = this.emitFile({ type: 'asset', fileName: 'renderStart.txt' });
				banner = this.emitFile({ type: 'asset', name: 'banner.txt' });
				bannerNamed = this.emitFile({ type: 'asset', fileName: 'banner.txt' });
				footer = this.emitFile({ type: 'asset', name: 'footer.txt' });
				footerNamed = this.emitFile({ type: 'asset', fileName: 'footer.txt' });
				intro = this.emitFile({ type: 'asset', name: 'intro.txt' });
				introNamed = this.emitFile({ type: 'asset', fileName: 'intro.txt' });
				outro = this.emitFile({ type: 'asset', name: 'outro.txt' });
				outroNamed = this.emitFile({ type: 'asset', fileName: 'outro.txt' });
				renderChunk = this.emitFile({ type: 'asset', name: 'renderChunk.txt' });
				renderChunkNamed = this.emitFile({ type: 'asset', fileName: 'renderChunk.txt' });
				generateBundle = this.emitFile({ type: 'asset', name: 'generateBundle.txt' });
				generateBundleNamed = this.emitFile({ type: 'asset', fileName: 'generateBundle.txt' });
				return (
					`export const renderStart = import.meta.ROLLUP_FILE_URL_${renderStart};\n` +
					`export const renderStartNamed = import.meta.ROLLUP_FILE_URL_${renderStartNamed};\n` +
					`export const renderStartNamedImmediately = '${this.getFileName(renderStartNamed)}';\n` +
					`export const bannerNamed = import.meta.ROLLUP_FILE_URL_${bannerNamed};\n` +
					`export const footerNamed = import.meta.ROLLUP_FILE_URL_${footerNamed};\n` +
					`export const introNamed = import.meta.ROLLUP_FILE_URL_${introNamed};\n` +
					`export const outroNamed = import.meta.ROLLUP_FILE_URL_${outroNamed};\n` +
					`export const renderChunkNamed = import.meta.ROLLUP_FILE_URL_${renderChunkNamed};\n` +
					`export const generateBundleNamed = import.meta.ROLLUP_FILE_URL_${generateBundleNamed};\n`
				);
			},
			renderStart() {
				this.setAssetSource(renderStart, 'renderStart');
				this.setAssetSource(renderStartNamed, 'renderStart');
			},
			banner() {
				this.setAssetSource(banner, 'banner');
				this.setAssetSource(bannerNamed, 'banner');
			},
			footer() {
				this.setAssetSource(footer, 'footer');
				this.setAssetSource(footerNamed, 'footer');
			},
			intro() {
				this.setAssetSource(intro, 'intro');
				this.setAssetSource(introNamed, 'intro');
			},
			outro() {
				this.setAssetSource(outro, 'outro');
				this.setAssetSource(outroNamed, 'outro');
			},
			renderChunk() {
				this.setAssetSource(renderChunk, 'renderChunk');
				this.setAssetSource(renderChunkNamed, 'renderChunk');
			},
			generateBundle(options) {
				const localAsset = this.emitFile({ type: 'asset', name: 'generateBundle-format.txt' });
				const localAssetNamed = this.emitFile({
					type: 'asset',
					fileName: 'generateBundle-format.txt'
				});
				this.setAssetSource(localAsset, options.format);
				this.setAssetSource(localAssetNamed, options.format);
				this.setAssetSource(
					generateBundle,
					`generateBundle ${options.format} with ${this.getFileName(localAsset)}`
				);
				this.setAssetSource(
					generateBundleNamed,
					`generateBundle ${options.format} with ${this.getFileName(localAsset)}`
				);
			}
		}
	}
});
