const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'includes an external module included dynamically by an alias',
	options: {
		input: path.join(__dirname, 'first', 'main.js'),
		external: ['lodash'],

		// Define a simple alias plugin for underscore
		plugins: [
			{
				resolveId(id) {
					if (id === 'underscore') {
						return 'lodash';
					}
				}
			}
		]
	},

	context: {
		require(required) {
			assert.equal(required, 'lodash');
			return 1;
		}
	}
};
