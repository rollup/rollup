System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			function foo () {
				console.log( 'hello from foo.js' );
			}

			function bar () {
				console.log( 'hello from bar.js' );
			}

			console.log( 'hello from main.js' );

			foo();
			bar();

		})
	};
}));
