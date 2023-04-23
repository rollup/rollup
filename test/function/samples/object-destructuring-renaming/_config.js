const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'renaming destructured object properties should request the correct property (#527)',
	exports(exports) {
		assert.equal(exports.env, process.env);
	}
});
