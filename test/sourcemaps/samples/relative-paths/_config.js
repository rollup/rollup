const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
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
});
