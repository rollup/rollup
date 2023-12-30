System.register('foo', ['external'], (function (exports) {
	'use strict';
	var a, b;
	return {
		setters: [function (module) {
			a = module.default;
			b = module.b;
		}],
		execute: (function () {

			/* this is an intro */

			// intro 1

			// intro 2

			// intro 3

			// intro 4

			console.log( a );
			console.log( b );

			var main = exports("default", 42);

			/* this is an outro */

			// outro 1

			// outro 2

			// outro 3

			// outro 4

		})
	};
}));
