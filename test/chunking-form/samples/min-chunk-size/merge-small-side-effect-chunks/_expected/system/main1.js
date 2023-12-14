System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const small = exports("small", '12345678901234567890123456789012345678901234567890');
			console.log('effect');

		})
	};
}));
