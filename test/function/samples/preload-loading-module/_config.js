const assert = require('node:assert');

let preloadedCode;

module.exports = defineTest({
	description: 'waits for pre-loaded modules that are currently loading',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				load(id) {
					this.load({ id }).then(({ code }) => (preloadedCode = code));
				},
				buildEnd() {
					assert.strictEqual(preloadedCode, 'assert.ok(true);\n');
				}
			}
		]
	}
});
