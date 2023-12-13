System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('effect');
			const small = exports("s", '1');

		})
	};
}));
