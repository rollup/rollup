module.exports = defineTest({
	description: 'chunk aliasing with extensions',
	options: {
		output: {
			manualChunks(id) {
				if (id.endsWith('main.js')) return;
				if (id.endsWith('a.js')) return 'first';
				return 'second';
			}
		}
	}
});
