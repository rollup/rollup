const path = require('path');

module.exports = {
	description: 'Throws if an emitted entry chunk cannot be resolved',
	options: {
		strictDeprecations: false,
		input: 'main.js',
		plugins: {
			buildStart() {
				this.emitChunk('not-found.js');
			}
		}
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Could not resolve entry module (not-found.js).',
		watchFiles: [path.join(__dirname, 'main.js')]
	}
};
