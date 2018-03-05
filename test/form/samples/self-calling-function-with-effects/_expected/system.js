System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function foo ( x ) {
				effect( x );
				if ( x > 0 ) foo( x - 1 );
			}

			function bar ( x ) {
				effect( x );
				if ( x > 0 ) baz( x );
			}

			function baz ( x ) {
				bar( x - 1 );
			}

			foo( 10 );
			bar( 10 );

		}
	};
});
