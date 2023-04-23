module.exports = defineTest({
	description: 'supports emitting assets from plugin hooks',
	options: {
		input: ['main.js'],
		plugins: {
			buildStart() {
				this.emitFile({ type: 'asset', name: 'buildStart.txt', source: 'buildStart' });
				this.emitFile({
					type: 'asset',
					fileName: 'custom/buildStart.txt',
					source: 'buildStart-custom'
				});
			},
			resolveId() {
				this.emitFile({ type: 'asset', name: 'resolveId.txt', source: 'resolveId' });
				this.emitFile({
					type: 'asset',
					fileName: 'custom/resolveId.txt',
					source: 'resolveId-custom'
				});
			},
			load() {
				this.emitFile({ type: 'asset', name: 'load.txt', source: 'load' });
				this.emitFile({ type: 'asset', fileName: 'custom/load.txt', source: 'load-custom' });
			},
			transform() {
				this.emitFile({ type: 'asset', name: 'transform.txt', source: 'transform' });
				this.emitFile({
					type: 'asset',
					fileName: 'custom/transform.txt',
					source: 'transform-custom'
				});
			},
			buildEnd() {
				this.emitFile({ type: 'asset', name: 'buildEnd.txt', source: 'buildEnd' });
				this.emitFile({
					type: 'asset',
					fileName: 'custom/buildEnd.txt',
					source: 'buildEnd-custom'
				});
			},
			renderStart() {
				this.emitFile({ type: 'asset', name: 'renderStart.txt', source: 'renderStart' });
				this.emitFile({
					type: 'asset',
					fileName: 'custom/renderStart.txt',
					source: 'renderStart-custom'
				});
			},
			banner() {
				this.emitFile({ type: 'asset', name: 'banner.txt', source: 'banner' });
				this.emitFile({ type: 'asset', fileName: 'custom/banner.txt', source: 'banner-custom' });
			},
			footer() {
				this.emitFile({ type: 'asset', name: 'footer.txt', source: 'footer' });
				this.emitFile({ type: 'asset', fileName: 'custom/footer.txt', source: 'footer-custom' });
			},
			intro() {
				this.emitFile({ type: 'asset', name: 'intro.txt', source: 'intro' });
				this.emitFile({ type: 'asset', fileName: 'custom/intro.txt', source: 'intro-custom' });
			},
			outro() {
				this.emitFile({ type: 'asset', name: 'outro.txt', source: 'outro' });
				this.emitFile({ type: 'asset', fileName: 'custom/outro.txt', source: 'outro-custom' });
			},
			renderChunk() {
				this.emitFile({ type: 'asset', name: 'renderChunk.txt', source: 'renderChunk' });
				this.emitFile({
					type: 'asset',
					fileName: 'custom/renderChunk.txt',
					source: 'renderChunk-custom'
				});
			},
			generateBundle() {
				this.emitFile({ type: 'asset', name: 'generateBundle.txt', source: 'generateBundle' });
				this.emitFile({
					type: 'asset',
					fileName: 'custom/generateBundle.txt',
					source: 'generateBundle-custom'
				});
			}
		}
	}
});
