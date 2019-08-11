System.register([], function () {
	'use strict';
	return {
		execute: function () {

			var foo = () => {};

			while ( true ) {
				var foo = () => console.log( 'effect' );
				break;
			}

			foo();

			function baz () {}

			while ( true ) {
				function baz () {
					console.log( 'effect' );
				}

				break;
			}

			baz();

		}
	};
});
