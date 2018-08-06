const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'user-facing bundle has modules array',
	bundle(bundle) {
		assert.ok(bundle.modules);
		assert.equal(bundle.modules.length, 2);
		assert.equal(path.relative(bundle.modules[1].id, path.resolve(__dirname, 'foo.js')), '');
		assert.equal(path.relative(bundle.modules[0].id, path.resolve(__dirname, 'main.js')), '');
	}
};
