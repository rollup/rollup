const path = require('path');

module.exports = {
	description: 'disallows assignments to imported bindings',
	error: {
		code: 'ILLEGAL_REASSIGNMENT',
		message: `Illegal reassignment to import 'x'`,
		id: path.join(__dirname, 'main.js'),
		pos: 113,
		watchFiles: [path.join(__dirname, 'main.js'), path.join(__dirname, 'foo.js')],
		loc: {
			file: path.join(__dirname, 'main.js'),
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
