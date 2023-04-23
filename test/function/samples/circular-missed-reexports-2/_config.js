const assert = require('node:assert');
const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_DEP1 = path.join(__dirname, 'dep1.js');
const ID_DEP2 = path.join(__dirname, 'dep2.js');

module.exports = defineTest({
	description: 'handles circular reexports',
	exports(exports) {
		assert.strictEqual(exports.exists, 42);
	},
	error: {
		code: 'CIRCULAR_REEXPORT',
		exporter: ID_DEP1,
		message:
			'"doesNotExist" cannot be exported from "dep1.js" as it is a reexport that references itself.',
		watchFiles: [ID_DEP1, ID_DEP2, ID_MAIN]
	}
});
