module.exports = {
	description: 'Throws if an emitted entry chunk cannot be resolved',
	options: {
		input: 'main.js',
		plugins: {
			buildStart() {
				this.emitChunk('not-found.js');
			}
		}
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Could not resolve entry module (not-found.js).'
	}
};
