var path = require('path');
var assert = require('assert');

module.exports = {
	description: 'uses custom path resolvers (plural)',
	options: {
		plugins: [
			{
				resolveId: function(importee) {
					if (importee[0] === '@') return path.resolve(__dirname, 'globals-' + importee.slice(1).toLowerCase() + '.js');
				},
				load: function(id) {
					if (id === '<empty>') return '';
				}
			},
			{
				resolveId: function(importee) {
					if (importee[0] === '!') return '<empty>';
				}
			}
		]
	},
	exports: function(exports) {
		assert.strictEqual(exports.res, 0);
	}
};
