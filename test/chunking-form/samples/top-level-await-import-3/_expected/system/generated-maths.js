System.register(['./generated-square.js'], (function (exports) {
	'use strict';
	var square;
	return {
		setters: [function (module) {
			square = module.s;
			exports("square", module.s);
		}],
		execute: (function () {

			const cube = exports("cube", x => square(x) * x);

		})
	};
}));
