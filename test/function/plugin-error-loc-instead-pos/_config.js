const path = require( 'path' );

module.exports = {
	description: '`this.error(...)` accepts { line, column } object as second parameter (#1265)',
	options: {
		plugins: [{
			name: 'test',
			transform ( code, id ) {
				this.error( 'nope', { line: 1, column: 22 });
			}
		}]
	},
	error: {
		code: 'PLUGIN_ERROR',
		plugin: 'test',
		message: 'nope',
		id: path.resolve( __dirname, 'main.js' ),
		loc: {
			file: path.resolve( __dirname, 'main.js' ),
			line: 1,
			column: 22
		},
		frame: `
			1: assert.equal( 21 * 2, TK );
			                         ^
		`
	}
};
