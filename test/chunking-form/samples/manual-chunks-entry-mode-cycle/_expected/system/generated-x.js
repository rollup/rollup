System.register(['./generated-a.js', './generated-b.js'], (function (exports) {
	'use strict';
	var a, b;
	return {
		setters: [function (module) {
			a = module.a;
		}, function (module) {
			b = module.b;
		}],
		execute: (function () {

			const x = exports("x", 'x' + a + b);

		})
	};
}));
