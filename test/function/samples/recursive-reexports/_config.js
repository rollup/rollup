const assert = require('node:assert');
const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_OTHER = path.join(__dirname, 'other.js');

module.exports = defineTest({
	description: 'handles recursive namespace reexports',
	exports(exports) {
		assert.deepStrictEqual(exports, { main: 'main', other: 'other' });
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_OTHER, ID_MAIN],
			message: 'Circular dependency: main.js -> other.js -> main.js'
		}
	]
});
