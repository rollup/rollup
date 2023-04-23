const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
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
});
