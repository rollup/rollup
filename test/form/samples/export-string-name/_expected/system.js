System.register('bundle', ['x'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("'x", module.x);
		}],
		execute: (function () {

			exports({
				__proto__: null,
				"'a": a,
				"'b": b
			});

			const y = exports("'y", 1);

			function a () {}
			function b () {}

		})
	};
}));
