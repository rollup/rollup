System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const foo = exports("foo", () => {});
			const bar = exports("bar", () => {});
			const baz = exports("baz", () => {});
			const qux = exports("qux", () => {});

		})
	};
}));
