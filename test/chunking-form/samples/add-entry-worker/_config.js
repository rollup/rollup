let metaId;

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
						// TODO Lukas is there a way to prevent reemitting the same entry point? What about already existing ones?
						metaId = this.addEntry('worker');
					}
					return `
export const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(import.meta.ROLLUP_CHUNK_URL_${metaId});
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
