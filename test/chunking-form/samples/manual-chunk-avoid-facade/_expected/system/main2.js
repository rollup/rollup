System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const value = exports("reexported", 42);

			console.log('main2', value);

		})
	};
}));
