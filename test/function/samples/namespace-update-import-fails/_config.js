const assert = require('node:assert');
const path = require('node:path');
const { assertIncludes } = require('../../../utils.js');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'disallows updates to namespace exports',
	code(code) {
		assertIncludes(code, 'foo++');
	},
	warnings: [
		{
			code: 'ILLEGAL_REASSIGNMENT',
			message: 'Illegal reassignment of import "exp" in "main.js".',
			id: ID_MAIN,
			pos: 31,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 3
			},
			frame: `
				1: import * as exp from './foo';
				2:
				3: exp['foo']++;
				   ^`
		}
	],
	runtimeError(error) {
		assert.strictEqual(error.message, 'Assignment to constant variable.');
	}
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/namespace-update-import-fails
