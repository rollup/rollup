const path = require('path');

module.exports = {
	description: 'throws for entry points that are resolved as false by plugins',
	options: {
		plugins: {
			resolveId() {
				return false;
			}
		}
	},
	error: {
		code: 'UNRESOLVED_ENTRY',
		message: `Entry module cannot be external (${path.resolve(__dirname, 'main.js')}).`
	}
};
