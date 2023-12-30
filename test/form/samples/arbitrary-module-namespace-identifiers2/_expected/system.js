System.register('myBundle', ['external'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("'x", module.x);
		}],
		execute: (function () {

			exports({
				"'a": a,
				"'b": b
			});

			function a () {}
			function b () {}

		})
	};
}));
