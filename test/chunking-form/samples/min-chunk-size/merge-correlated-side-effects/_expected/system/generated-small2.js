System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('other effect');

			const small2 = exports("s", '2');

		})
	};
}));
