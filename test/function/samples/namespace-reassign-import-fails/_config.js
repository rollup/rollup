const path = require('path');

module.exports = {
	description: 'warns for reassignments to namespace exports',
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
			3: exp.foo = 2;
			   ^
		`
		}
	]
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/namespace-reassign-import-fails
