System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = exports("f", 'foo');

			console.log('side effect');

		})
	};
}));
