var assert = require( 'assert' );

module.exports = {
	description: 'Dynamic import expression replacement',
	options: {
		acorn: {
			plugins: { dynamicImport: true }
		},
		plugins: [{
			resolveDynamicImport (specifier, parent) {
				if ( typeof specifier !== 'string' ) {
					// string literal concatenation
					if ( specifier.type === 'BinaryExpression' && specifier.operator === '+' &&
							specifier.left.type === 'Literal' && specifier.right.type === 'Literal' &&
							typeof specifier.left.value === 'string' && typeof specifier.right.value === 'string' ) {
						return '"' + specifier.left.value + specifier.right.value + '"';
					}
				}
			}
		}]
	},
	code: function ( code ) {
		assert.notEqual( code.indexOf('import( "x/y" )'), -1 );
	},
	runtimeError: function ( error ) {
		try {
			assert.equal( "Unexpected token import", error.message );
		}
		catch ( e ) {
			assert.equal( "Unexpected reserved word", error.message );
		}
	}
};
