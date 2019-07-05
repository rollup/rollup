// TODO Lukas implement this
module.exports = {
	// solo: true,
	skip: true,
	description: 'supports emitting files from plugin hooks',
	options: {
		input: ['main.js'],
		plugins: {
			buildStart() {
				this.emitFile({ type: 'file', fileName: 'buildStart.txt', source: 'This is buildStart' });
			}
		}
	}
};
