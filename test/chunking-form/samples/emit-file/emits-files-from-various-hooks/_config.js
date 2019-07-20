module.exports = {
	description: 'supports emitting assets from plugin hooks',
	options: {
		input: ['main.js'],
		plugins: {
			buildStart() {
				this.emitFile({ type: 'asset', name: 'buildStart.txt', source: 'buildStart' });
				this.emitFile({ type: 'asset', fileName: 'custom/buildStart.txt', source: 'buildStart' });
			},
			resolveId() {
				this.emitFile({ type: 'asset', name: 'resolveId.txt', source: 'resolveId' });
				this.emitFile({ type: 'asset', fileName: 'custom/resolveId.txt', source: 'resolveId' });
			},
			load() {
				this.emitFile({ type: 'asset', name: 'load.txt', source: 'load' });
				this.emitFile({ type: 'asset', fileName: 'custom/load.txt', source: 'load' });
			},
			transform() {
				this.emitFile({ type: 'asset', name: 'transform.txt', source: 'transform' });
				this.emitFile({ type: 'asset', fileName: 'custom/transform.txt', source: 'transform' });
			},
			buildEnd() {
				this.emitFile({ type: 'asset', name: 'buildEnd.txt', source: 'buildEnd' });
				this.emitFile({ type: 'asset', fileName: 'custom/buildEnd.txt', source: 'buildEnd' });
			},
			renderStart() {
				this.emitFile({ type: 'asset', name: 'renderStart.txt', source: 'renderStart' });
				this.emitFile({ type: 'asset', fileName: 'custom/renderStart.txt', source: 'renderStart' });
			},
			banner() {
				this.emitFile({ type: 'asset', name: 'banner.txt', source: 'banner' });
				this.emitFile({ type: 'asset', fileName: 'custom/banner.txt', source: 'banner' });
			},
			footer() {
				this.emitFile({ type: 'asset', name: 'footer.txt', source: 'footer' });
				this.emitFile({ type: 'asset', fileName: 'custom/footer.txt', source: 'footer' });
			},
			intro() {
				this.emitFile({ type: 'asset', name: 'intro.txt', source: 'intro' });
				this.emitFile({ type: 'asset', fileName: 'custom/intro.txt', source: 'intro' });
			},
			outro() {
				this.emitFile({ type: 'asset', name: 'outro.txt', source: 'outro' });
				this.emitFile({ type: 'asset', fileName: 'custom/outro.txt', source: 'outro' });
			},
			renderChunk() {
				this.emitFile({ type: 'asset', name: 'renderChunk.txt', source: 'renderChunk' });
				this.emitFile({ type: 'asset', fileName: 'custom/renderChunk.txt', source: 'renderChunk' });
			},
			generateBundle() {
				this.emitFile({ type: 'asset', name: 'generateBundle.txt', source: 'generateBundle' });
				this.emitFile({
					type: 'asset',
					fileName: 'custom/generateBundle.txt',
					source: 'generateBundle'
				});
			}
		}
	}
};
