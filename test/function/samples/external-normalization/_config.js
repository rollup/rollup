const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'external paths from custom resolver remain external (#633)',
	options: {
		external: ['path'],
		plugins: [
			{
				resolveId: id => {
					if (id == './dep.js') return 'path';
					return id;
				}
			}
		]
	},
	exports: exports => {
		assert.equal(exports, path.resolve);
	}
};
