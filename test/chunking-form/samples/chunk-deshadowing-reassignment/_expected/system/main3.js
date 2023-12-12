System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var x = exports("x", 42);
			console.log('dep1');

		})
	};
}));
