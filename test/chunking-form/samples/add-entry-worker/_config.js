let metaId;

// TODO Lukas can we load requirejs via renderChunk?
// importScripts('../../../../../../node_modules/requirejs/require.js');
// requirejs([], function () { ...
// also test shared modules
module.exports = {
	description: 'allows adding additional entry points',
	options: {
		input: 'main',
		output: {
			chunkFileNames: 'chunks/[name].js'
		},
		plugins: {
			load(id) {
				if (id === 'merged' || id === 'nested') {
					if (!metaId) {
						metaId = this.emitEntryChunk('worker');
					}
					return `
export const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(import.meta.ROLLUP_CHUNK_URL_${metaId}, {type: 'module'});
  worker.onmessage = resolve;
});`;
				}
			},
			resolveId(id) {
				if (id === 'merged' || id === 'nested') {
					return id;
				}
				return null;
			}
		}
	}
};
