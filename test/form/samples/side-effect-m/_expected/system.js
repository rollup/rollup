System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function odd ( n ) {
				return n !== 0 && even( n - 1 );
			}

			var counter = 0;

			// This should be in the output
			var foo = odd( 12 );

			function even ( n ) {
				alert( counter++ );
				return n === 0 || odd( n - 1 );
			}

			console.log( even( 5 ) );

			console.log( counter );

		}
	};
});
