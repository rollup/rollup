System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('side effect');

			const B = exports("B", 1);

		})
	};
}));
