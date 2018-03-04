System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var effect1 = () => console.log( 'effect' );
			var associated = () => {};
			for ( var associated of [ effect1 ] ) {}
			associated();

			var effect3 = () => console.log( 'effect' ); // Must not be removed!
			for ( const foo of [ effect3 ] ) {
				foo(); // Must not be removed!
			}

			for ( globalVar of [ 1 ] ) {}

		}
	};
});
