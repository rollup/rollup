System.register('myBundle', ['external'], (function (exports) {
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

			function a () {}
			function b () {}

		})
	};
}));
