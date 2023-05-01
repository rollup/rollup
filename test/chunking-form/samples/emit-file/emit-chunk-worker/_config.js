const path = require('node:path');

let workerId;
let proxyId;

module.exports = defineTest({
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
						workerId = this.emitFile({ type: 'chunk', id: 'worker' });
						proxyId = this.emitFile({ type: 'chunk', id: 'worker-proxy' });
					}
					return `
export const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(import.meta.ROLLUP_FILE_URL_${proxyId});
  worker.onmessage = resolve;
});`;
				}
				if (id === 'worker-proxy') {
					return `PLACEHOLDER(import.meta.ROLLUP_FILE_URL_${workerId})`;
				}
			},
			renderChunk(code, chunk, options) {
				if (chunk.facadeModuleId === 'worker-proxy') {
					const chunkFileName = `./${path.relative(
						path.dirname(chunk.fileName),
						this.getFileName(workerId)
					)}`;
					if (options.format === 'system') {
						return `importScripts('../../../../../../../../node_modules/systemjs/dist/system.js');
System.import('${chunkFileName}');`;
					}
					if (options.format === 'amd') {
						return `importScripts('../../../../../../../../node_modules/requirejs/require.js');
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
});
