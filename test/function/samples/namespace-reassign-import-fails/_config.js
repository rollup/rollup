const assert = require('node:assert');
const path = require('node:path');
const { assertIncludes } = require('../../../utils.js');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_FOO = path.join(__dirname, 'foo.js');

module.exports = defineTest({
	description: 'warns for reassignments to namespace exports',
	code(code) {
		assertIncludes(code, 'foo = 2');
		assertIncludes(code, 'undefined = 3');
	},
	warnings: [
		{
			binding: 'bar',
			code: 'MISSING_EXPORT',
			exporter: ID_FOO,
			id: ID_MAIN,
			message: '"bar" is not exported by "foo.js", imported by "main.js".',
			url: 'https://rollupjs.org/troubleshooting/#error-name-is-not-exported-by-module',
			pos: 48,
			loc: {
				column: 4,
				file: ID_MAIN,
				line: 4
			},
			frame: `
				2:
				3: exp.foo = 2;
				4: exp.bar = 3;
				       ^`
		},
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
				3: exp.foo = 2;
				   ^
				4: exp.bar = 3;`
		},
		{
			code: 'ILLEGAL_REASSIGNMENT',
			message: 'Illegal reassignment of import "exp" in "main.js".',
			id: ID_MAIN,
			pos: 44,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 4
			},
			frame: `
				2:
				3: exp.foo = 2;
				4: exp.bar = 3;
				   ^`
		}
	],
	runtimeError(error) {
		assert.strictEqual(error.message, 'Assignment to constant variable.');
	}
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/namespace-reassign-import-fails
