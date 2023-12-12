System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			/** A comment for a number */
			var number = 5;

			/** A comment for obj */
			var obj = exports("obj", { number });

		})
	};
}));
