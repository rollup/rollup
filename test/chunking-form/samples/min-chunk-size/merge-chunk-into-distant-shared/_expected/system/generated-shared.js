System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const small = exports("a", '1');

			const shared = exports("s", '1');
			console.log('effect');

		})
	};
}));
