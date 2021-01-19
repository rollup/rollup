const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'uses custom path resolvers (plural)',
	options: {
		plugins: [
			{
				resolveId(importee) {
					if (importee[0] === '@')
						return path.join(__dirname, 'globals-' + importee.slice(1).toLowerCase() + '.js');
				},
				load(id) {
					if (id === '<empty>') return '';
				}
			},
			{
				resolveId(importee) {
					if (importee[0] === '!') return '<empty>';
				}
			}
		]
	},
	exports(exports) {
		assert.strictEqual(exports.res, 0);
	}
};
