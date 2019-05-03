const path = require('path');

let workerId;
let proxyId;

module.exports = {
	description: 'allows adding additional chunks to be used in workers',
	options: {
		input: 'main',
		output: {
			chunkFileNames: 'chunks/[name].js'
		},
		plugins: {
			load(id) {
				if (id === 'merged' || id === 'nested') {
					if (!workerId) {
						workerId = this.emitChunk('worker');
						proxyId = this.emitChunk('worker-proxy');
					}
					return `
export const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(import.meta.ROLLUP_CHUNK_URL_${proxyId});
  worker.onmessage = resolve;
});`;
				}
				if (id === 'worker-proxy') {
					return `PLACEHOLDER(import.meta.ROLLUP_CHUNK_URL_${workerId})`;
				}
			},
			renderChunk(code, chunk, options) {
				if (chunk.facadeModuleId === 'worker-proxy') {
					const chunkFileName = `./${path.relative(
						path.dirname(chunk.fileName),
						this.getChunkFileName(workerId)
					)}`;
					if (options.format === 'system') {
						return `importScripts('../../../../../../../node_modules/systemjs/dist/system.js');
System.import('${chunkFileName}');`;
					}
					if (options.format === 'amd') {
						return `importScripts('../../../../../../../node_modules/requirejs/require.js');
requirejs(['${chunkFileName}']);`;
					}
				}
			},
			resolveId(id) {
				if (id === 'merged' || id === 'nested' || id === 'worker-proxy') {
					return id;
				}
				return null;
			}
		}
	}
};
