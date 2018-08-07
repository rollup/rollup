const path = require('path');

module.exports = {
	description: 'disallows reassignments to namespace exports',
	error: {
		code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
		message: `Illegal reassignment to import 'exp'`,
		pos: 31,
		loc: {
			file: path.resolve(__dirname, 'main.js'),
			line: 3,
			column: 0
		},
		frame: `
			1: import * as exp from './foo';
			2:
			3: exp.foo = 2;
			   ^
		`
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/namespace-reassign-import-fails
