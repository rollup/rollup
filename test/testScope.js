require('babel/register');
var assert = require( 'assert' );

var Scope = require( '../src/Scope' );

describe( 'Scope', function () {
	it( 'can define and bind names', function () {
		const scope = new Scope();

		// If I define 'a'...
		scope.define( 'a' );

		// ... and bind 'b' to a reference to 'a'...
		scope.bind( 'b', scope.reference( 'a' ) );

		// ... lookups for 'a' and 'b' should both
		// resolve to the same identifier.
		assert.equal( scope.lookup( 'b' ), scope.lookup( 'a' ) );
	});

	describe( 'virtual scope:', function () {
		var real, a, b;

		beforeEach(function () {
			real = new Scope();
			a = real.virtual();
			b = real.virtual();
		});

		it( 'is created within another scope', function () {
			// The actual ids are the same.
			assert.equal( real.ids, a.ids );
			assert.equal( real.ids, b.ids );
		});

		it( 'lookups different identifiers', function () {
			// If I define 'a' in both scopes...
			a.define( 'a' );
			b.define( 'a' );

			// ... the name 'a' should lookup different identifiers.
			assert.notEqual( a.lookup( 'a' ), b.lookup( 'b' ) );
		});

		it( 'can deconflict names', function () {
			a.define( 'a' );
			b.define( 'a' );

			// Deconflicting the actual scope should make all identifiers unique.
			real.deconflict();

			assert.deepEqual( real.usedNames(), [ '_a', 'a' ] );
		});

		it( 'deconflicts with a custom function, if provided', function () {
			for (var i = 0; i < 26; i++) {
				// Create 26 scopes, all of which define 'a'.
				real.virtual().define( 'a' );
			}

			// Custom deconfliction function which ignores the current name.
			var num = 10;
			real.deconflict( function () {
				return (num++).toString(36);
			});

			assert.deepEqual( real.usedNames(), 'abcdefghijklmnopqrstuvwxyz'.split('') );

			// Deconflicting twice has no additional effect.
			real.deconflict();
			assert.deepEqual( real.usedNames(), 'abcdefghijklmnopqrstuvwxyz'.split('') );
		});
	});

	it( 'dedupes-external-imports', function () {
		var real = new Scope();

		var external = real.virtual(),
			locals = real.virtual(),
			exports = real.virtual();

		external.define( 'Component' );

		locals.bind( 'Comp', external.reference( 'Component' ) );

		exports.bind( 'default', locals.reference( 'Foo' ) );

		try {
			real.deconflict();
			assert.ok( false, 'Scope.deconflict should throw with "Foo" undefined' );
		} catch ( ignore ) {
			// as expected
		}

		locals.define( 'Foo' );

		real.deconflict();
	});
});
