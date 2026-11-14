System.register(['./generated-manual.js', './generated-b.js'], (function (exports) {
	'use strict';
	var a;
	return {
		setters: [function (module) {
			a = module.a;
		}, null],
		execute: (function () {

			const b = exports("b", 'b' + a);

		})
	};
}));
