const assert = require('assert');
const path = require('path');
const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'disallows updates to namespace exports',
	code(code) {
		assertIncludes(code, 'foo++');
	},
	warnings: [
		{
			code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
			message: `Illegal reassignment to import 'exp'`,
			id: path.resolve(__dirname, 'main.js'),
			pos: 31,
			loc: {
				file: path.resolve(__dirname, 'main.js'),
				line: 3,
				column: 0
			},
			frame: `
			1: import * as exp from './foo';
			2:
			3: exp['foo']++;
			   ^
		`
		}
	],
	runtimeError(error) {
		assert.strictEqual(error.message, 'Assignment to constant variable.');
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/namespace-update-import-fails
