module.exports = {
	description: 'deduplicates asset that have the same source',
	options: {
		input: ['main.js'],
		plugins: {
			buildStart() {
				this.emitFile({ type: 'asset', name: 'string.txt', source: 'string' });
				this.emitFile({ type: 'asset', name: 'otherString.txt', source: 'otherString' });

				// specific file names will not be deduplicated
				this.emitFile({ type: 'asset', fileName: 'named/string.txt', source: 'named' });
				return null;
			}
		}
	}
};
