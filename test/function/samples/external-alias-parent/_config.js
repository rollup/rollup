const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'includes an external module included dynamically by an alias',
	options: {
		input: path.join(__dirname, 'first', 'main.js'),
		external(id, parentId, isResolved) {
			if (isResolved === false || !parentId) return false;
			return parentId.endsWith('main.js') ? id === 'lodash' : id === 'underscore';
		},

		// Define a simple alias plugin for underscore
		plugins: [
			{
				resolveId(id, parentId) {
					if (id === 'underscore' && parentId && parentId.endsWith('main.js')) {
						return 'lodash';
					}
				}
			}
		]
	},

	context: {
		require(required) {
			assert(required === 'lodash' || required === 'underscore');
			return 1;
		}
	}
});
