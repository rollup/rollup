var path = require('path');
var assert = require('assert');

module.exports = {
	description: 'user-facing bundle has resolvedIds map in every modules',
	bundle: function(bundle) {
		assert.ok(bundle.modules[0].resolvedIds);
		assert.ok(bundle.modules[1].resolvedIds);
		assert.equal(Object.keys(bundle.modules[1].resolvedIds).length, 0);
		assert.equal(Object.keys(bundle.modules[0].resolvedIds).length, 1);
		assert.equal(bundle.modules[0].resolvedIds['./foo'], path.resolve(__dirname, 'foo.js'));
	}
};
