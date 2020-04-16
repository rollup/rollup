module.exports = {
	description:
		'Does not warn if preserveEntrySignatures is not set and an empty facade is created for a plugin chunk',
	options: {
		input: [],
		plugins: {
			buildStart() {
				this.emitFile({ type: 'chunk', id: 'main', name: 'entry' });
			}
		}
	}
};
