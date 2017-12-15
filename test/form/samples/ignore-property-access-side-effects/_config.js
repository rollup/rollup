var path = require('path');

module.exports = {
	description: 'ignore side-effects when accessing properties if treeshake.propertyReadSideEffects is false',
	options: {
		treeshake: {
			propertyReadSideEffects: false
		}
	}
};
