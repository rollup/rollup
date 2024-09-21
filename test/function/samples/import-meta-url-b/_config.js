const assert = require('node:assert');

const source = 'example.com/main.js';

module.exports = defineTest({
	description: 'Access document.currentScript at the top level',
	context: {
		document: {
			currentScript: {
				src: source,
				tagName: 'SCRIPT'
			}
		}
	},
	exports(exports) {
		assert.strictEqual(exports(), source);
	}
});
