let renderStart;
let banner;
let footer;
let intro;
let outro;
let renderChunk;
let generateBundle;

module.exports = {
	description: 'supports setting the asset source during generate',
	options: {
		input: ['main.js'],
		plugins: {
			load() {
				renderStart = this.emitFile({ type: 'asset', name: 'renderStart.txt' });
				banner = this.emitFile({ type: 'asset', name: 'banner.txt' });
				footer = this.emitFile({ type: 'asset', name: 'footer.txt' });
				intro = this.emitFile({ type: 'asset', name: 'intro.txt' });
				outro = this.emitFile({ type: 'asset', name: 'outro.txt' });
				renderChunk = this.emitFile({ type: 'asset', name: 'renderChunk.txt' });
				generateBundle = this.emitFile({ type: 'asset', name: 'generateBundle.txt' });
				return (
					`export const renderStart = import.meta.ROLLUP_FILE_URL_${renderStart};\n` +
					`export const banner = import.meta.ROLLUP_FILE_URL_${banner};\n` +
					`export const footer = import.meta.ROLLUP_FILE_URL_${footer};\n` +
					`export const intro = import.meta.ROLLUP_FILE_URL_${intro};\n` +
					`export const outro = import.meta.ROLLUP_FILE_URL_${outro};\n`
				);
			},
			renderStart() {
				this.setAssetSource(renderStart, 'renderStart');
			},
			banner() {
				this.setAssetSource(banner, 'banner');
			},
			footer() {
				this.setAssetSource(footer, 'footer');
			},
			intro() {
				this.setAssetSource(intro, 'intro');
			},
			outro() {
				this.setAssetSource(outro, 'outro');
			},
			renderChunk() {
				this.setAssetSource(renderChunk, 'renderChunk');
			},
			generateBundle(options) {
				const localAsset = this.emitFile({ type: 'asset', name: 'generateBundle-format.txt' });
				this.setAssetSource(localAsset, options.format);
				this.setAssetSource(
					generateBundle,
					`generateBundle ${options.format} with ${this.getAssetFileName(localAsset)}`
				);
			}
		}
	}
};
