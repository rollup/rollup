const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'user-facing bundle has modules array',
	bundle(bundle) {
		assert.ok(bundle.cache.modules);
		assert.equal(bundle.cache.modules.length, 2);
		assert.equal(path.relative(bundle.cache.modules[0].id, path.join(__dirname, 'foo.js')), '');
		assert.equal(path.relative(bundle.cache.modules[1].id, path.join(__dirname, 'main.js')), '');
	}
};
