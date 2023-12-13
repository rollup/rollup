System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			let foo = exports("foo", 'foo');

			exports("foo", foo = 'bar');

		})
	};
}));
