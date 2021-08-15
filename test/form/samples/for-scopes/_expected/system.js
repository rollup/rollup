System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			var effect1 = () => console.log( 'effect' );
			var associated = () => {};
			for ( var associated = effect1; true; ) {
				break;
			}
			associated();

			var effect3 = () => console.log( 'effect' ); // Must not be removed!
			for ( let foo = effect3; true; ) {
				foo(); // Must not be removed!
				break;
			}

		})
	};
}));
