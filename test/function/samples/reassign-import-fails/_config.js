var path = require('path');
var assert = require('assert');

module.exports = {
	description: 'disallows assignments to imported bindings',
	error: {
		code: 'ILLEGAL_REASSIGNMENT',
		message: `Illegal reassignment to import 'x'`,
		pos: 113,
		loc: {
			file: path.resolve(__dirname, 'main.js'),
			line: 8,
			column: 0
		},
		frame: `
			6: });
			7:
			8: x = 10;
			   ^
		`
	}
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/reassign-import-fails
