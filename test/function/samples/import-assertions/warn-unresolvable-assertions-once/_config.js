const assert = require('node:assert/strict');
const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'warns only once about invalid dynamic import attributes',
	verifyAst: false,
	warnings(warnings) {
		assert.equal(warnings.length, 1);
		assert.deepEqual(
			{ code: warnings[0].code, id: warnings[0].id, pos: warnings[0].pos },
			{ code: 'INVALID_IMPORT_ATTRIBUTE', id: ID_MAIN, pos: 56 }
		);
	}
});
