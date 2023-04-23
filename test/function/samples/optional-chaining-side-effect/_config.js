const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'handles side effects in optional chaining (#4806)',
	exports({ get, set }) {
		set(['test']);
		assert.strictEqual(get('test'), 't');
	}
});
