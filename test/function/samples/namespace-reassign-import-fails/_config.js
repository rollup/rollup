const assert = require('assert');
const path = require('path');
const { assertIncludes } = require('../../../utils.js');

const ID_MAIN = path.resolve(__dirname, 'main.js');

module.exports = {
	description: 'warns for reassignments to namespace exports',
	code(code) {
		assertIncludes(code, 'foo = 2');
		assertIncludes(code, 'undefined = 3');
	},
	warnings: [
		{
			code: 'MISSING_EXPORT',
			exporter: 'foo.js',
			frame: `
			2:
			3: exp.foo = 2;
			4: exp.bar = 3;
			       ^
		`,
			id: ID_MAIN,
			importer: 'main.js',
			loc: {
				column: 4,
				file: ID_MAIN,
				line: 4
			},
			message: "'bar' is not exported by 'foo.js'",
			missing: 'bar',
			pos: 48,
			url: 'https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module'
		},
		{
			code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
			message: `Illegal reassignment to import 'exp'`,
			id: ID_MAIN,
			pos: 31,
			loc: {
				file: ID_MAIN,
				line: 3,
				column: 0
			},
			frame: `
			1: import * as exp from './foo';
			2:
			3: exp.foo = 2;
			   ^
			4: exp.bar = 3;
		`
		},
		{
			code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
			message: `Illegal reassignment to import 'exp'`,
			id: ID_MAIN,
			pos: 44,
			loc: {
				file: ID_MAIN,
				line: 4,
				column: 0
			},
			frame: `
			2:
			3: exp.foo = 2;
			4: exp.bar = 3;
			   ^
		`
		}
	],
	runtimeError(error) {
		assert.strictEqual(error.message, 'Assignment to constant variable.');
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/namespace-reassign-import-fails
