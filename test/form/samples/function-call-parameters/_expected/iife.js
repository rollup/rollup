(function () {
	'use strict';

	// parameters are associated correctly
	const retained1 = function ( func, obj ) { return func( obj ); };
	retained1( obj => obj(), () => () => console.log( 'effect' ) )();

	const retained2 = function ( func, obj ) { return func( obj ); };
	retained2( obj => ({ foo: obj }), {} ).foo.bar.baz = 1;

	// parameters and arguments have the same values
	function retained3 ( x ) {
		x.foo.bar = 1;
	}

	retained3( {} );

	function retained4 ( x ) {
		arguments[ 0 ].foo.bar = 1;
	}

	retained4( {} );

	// assigning to an argument will change the corresponding parameter
	function retained5 ( x ) {
		arguments[ 0 ] = {};
		x.foo.bar = 1;
	}

	retained5( { foo: {} } );

	// assigning to a parameter will change the corresponding argument
	function retained6 ( x ) {
		x = {};
		arguments[ 0 ].foo.bar = 1;
	}

	retained6( { foo: {} } );

	// the number of arguments does not depend on the number of parameters
	function retained7 ( x ) {
		arguments[ 1 ].foo.bar = 1;
	}

	retained7( {}, {} );

}());
