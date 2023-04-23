const REGISTER_WORKLET = 'register-paint-worklet:';

module.exports = defineTest({
	description: 'allows adding additional chunks to be used in worklets',
	options: {
		input: 'main',
		output: {
			chunkFileNames: 'chunks/[name].js'
		},
		plugins: {
			load(id) {
				if (id.startsWith(REGISTER_WORKLET)) {
					return `CSS.paintWorklet.addModule(import.meta.ROLLUP_FILE_URL_${this.emitFile({
						type: 'chunk',
						id: id.slice(REGISTER_WORKLET.length)
					})});`;
				}
			},
			resolveId(id, importee) {
				if (id.startsWith(REGISTER_WORKLET)) {
					return this.resolve(id.slice(REGISTER_WORKLET.length), importee).then(
						resolvedId => REGISTER_WORKLET + resolvedId.id
					);
				}
				return null;
			}
		}
	}
});
