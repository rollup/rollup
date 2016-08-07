var path = require( 'path' );
var fs = require( 'fs' );
var assert = require( 'assert' );

var modules = {
	'x\\y': 'export default 42;',
	'x/y': 'export default 24;'
};

module.exports = {
	description: 'does not mangle entry point',
	options: {
		entry: 'x\\y',
		plugins: [{
			resolveId: function ( importee ) {
				return importee;
			},
			load: function ( moduleId ) {
				return modules[ moduleId ];
			}
		}]
	},
	exports: function ( exports ) {
		assert.equal( exports, 42 );
	}
};
