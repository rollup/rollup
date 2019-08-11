const assert = require('assert');

module.exports = {
	description: 'includes an external module with a false resolve return',
	options: {
		input: 'main.js',
		plugins: [
			{
				resolveId(id) {
					if (id === './external')
						return false;
				}
			}
		]
	},
	context: {
		require(required) {
			assert.equal(required, './external');
			return 1;
		}
	}
};
