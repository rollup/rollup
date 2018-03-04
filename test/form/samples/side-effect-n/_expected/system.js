System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function foo () {
				console.log( 'foo' );
			}

			function bar () {
				console.log( 'bar' );
			}

			( Math.random() < 0.5 ? foo : bar )();

		}
	};
});
