module.exports = {
	description: 'allows to define manual chunks via a function',
	options: {
		input: ['main-a'],
		manualChunks(id) {
			if (id[id.length - 5] === '-') {
				return `chunk-${id[id.length - 4]}`;
			}
		}
	}
};
