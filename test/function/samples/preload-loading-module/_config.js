const assert = require('assert');

let preloadedCode;

module.exports = {
	description: 'waits for pre-loaded modules that are currently loading',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				load(id) {
					this.load({ id }).then(({ code }) => (preloadedCode = code));
				},
				buildEnd(err) {
					assert.strictEqual(preloadedCode, 'assert.ok(true);\n');
				}
			}
		]
	}
};
