var assert = require( 'assert' );

module.exports = {
	description: 'Simple dynamic import support',
	options: {
		acorn: {
			plugins: { dynamicImport: true }
		},
		plugins: [{
			resolveDynamicImport (specifier, parent) {
				return 'asdf';
			}
		}]
	},
	code: function ( code ) {
		assert(code.indexOf('import("asdf")') > 0);
	},
	runtimeError: function ( error ) {
		assert.equal( "Unexpected token import", error.message );
	}
};
