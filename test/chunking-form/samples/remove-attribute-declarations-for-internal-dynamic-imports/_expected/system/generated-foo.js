System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = exports("foo", 'foo');
			console.log(foo);

		})
	};
}));
