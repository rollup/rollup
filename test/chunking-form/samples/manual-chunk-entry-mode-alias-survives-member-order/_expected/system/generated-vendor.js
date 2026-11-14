System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const x = exports("x", 'dep');

			const m = exports("m", 'manual' + x);

		})
	};
}));
