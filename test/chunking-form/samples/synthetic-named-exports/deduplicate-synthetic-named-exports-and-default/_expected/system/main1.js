System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var lib = exports("lib", { foo: true, bar: true, baz: true });

			exports("foo", lib.foo);

		})
	};
}));
