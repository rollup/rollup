System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var dep = { foo: 'bar' };
			// This should log a global variable
			console.log(foo);

			exports("foo", dep.foo);

		})
	};
}));
