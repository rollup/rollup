const path = require('path');

module.exports = {
	description: 'duplicate entry modules',
	options: {
		input: ['main.js', 'main.js']
	},
	error: {
		code: 'DUPLICATE_ENTRY_POINTS',
		message: `Duplicate entry points detected. The input entries main and main both point to the same module, ${path.resolve(
			__dirname,
			'main.js'
		)}`
	}
};
