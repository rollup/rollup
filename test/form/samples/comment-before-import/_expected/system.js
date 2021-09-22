System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			// bar.js
			var bar = 21;

			// foo.js

			var foo = bar * 2;

			// main.js

			console.log( foo );

		})
	};
}));
