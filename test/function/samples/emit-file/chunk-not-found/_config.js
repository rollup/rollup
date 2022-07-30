const path = require('path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'Throws if an emitted entry chunk cannot be resolved',
	options: {
		input: 'main.js',
		plugins: {
			buildStart() {
				this.emitFile({ type: 'chunk', id: 'not-found.js' });
			}
		}
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		watchFiles: [ID_MAIN],
		message: 'Could not resolve entry module "not-found.js".'
	}
};
