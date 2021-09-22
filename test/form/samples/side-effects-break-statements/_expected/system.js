System.register('myBundle', [], (function () {
	'use strict';
	return {
		execute: (function () {

			for ( let i = 0; i < 2; i++ ) {
				console.log( 'effect' );
				break;
			}

			for ( const val in { x: 1, y: 2 } ) {
				console.log( 'effect' );
				break;
			}

			for ( const val of { x: 1, y: 2 } ) {
				console.log( 'effect' );
				break;
			}

			while ( true ) {
				console.log( 'effect' );
				break;
			}

			do {
				console.log( 'effect' );
				break;
			} while ( true );

		})
	};
}));
