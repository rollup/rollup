const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'source paths are relative with relative dest (#344)',
	options: {
		output: {
			name: 'myModule',
			file: path.resolve(__dirname, '_actual/bundle.js')
		}
	},
	test(code, map) {
		assert.deepEqual(map.sources, ['../main.js']);
	}
};
