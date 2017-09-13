var path = require( 'path' );
var assert = require( 'assert' );

module.exports = {
	description: 'prevents a module from exporting itself',
	error: {
		code: 'CANNOT_IMPORT_SELF',
		message: `A module cannot export itself`,
		pos: 0,
		loc: {
			file: path.resolve( __dirname, 'main.js' ),
			line: 1,
			column: 0
		},
		frame: `
			1: export * from './main';
			   ^
		`
	}
};
