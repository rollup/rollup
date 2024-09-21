const assert = require('node:assert');

const source = 'example.com/main.js';

module.exports = defineTest({
	description: 'Get the right URL with compact output',
	context: {
		document: {
			currentScript: {
				src: source,
				tagName: 'SCRIPT'
			}
		}
	},
	options: {
		output: {
			compact: true
		}
	},
	exports(exports) {
		assert.strictEqual(exports(), source);
	}
});
