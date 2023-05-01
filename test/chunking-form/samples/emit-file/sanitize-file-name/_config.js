module.exports = defineTest({
	description: 'allows adding additional chunks and retrieving their file name',
	options: {
		input: 'main',
		plugins: {
			resolveId(id) {
				if (id === '\0virtual') {
					return id;
				}
			},
			load(id) {
				if (id === '\0virtual') {
					return `console.log('virtual');`;
				}
			},
			buildStart() {
				this.emitFile({ type: 'chunk', id: '\0virtual' });
			}
		}
	}
});
