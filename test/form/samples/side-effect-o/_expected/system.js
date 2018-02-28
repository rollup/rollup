System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function fn () {
				return Math.random() < 0.5 ? foo : bar;
			}

			function foo () {
				console.log( 'foo' );
			}

			function bar () {
				console.log( 'bar' );
			}

			fn()();

		}
	};
});
