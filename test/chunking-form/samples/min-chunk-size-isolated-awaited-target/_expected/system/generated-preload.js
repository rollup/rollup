System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("p", preload);

			function preload(callback) {
				return callback();
			}

		})
	};
}));
