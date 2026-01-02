System.register(['./generated-ac.js', './main.js'], (function (exports) {
	'use strict';
	var c, a;
	return {
		setters: [function (module) {
			c = module.c;
			a = module.a;
		}, null],
		execute: (function () {

			const b = exports("b", 'b');
			console.log(b + c);

			console.log(a);

		})
	};
}));
