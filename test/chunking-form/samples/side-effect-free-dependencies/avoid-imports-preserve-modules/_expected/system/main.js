System.register(['./a.js', './one.js'], (function () {
	'use strict';
	var a, d;
	return {
		setters: [function (module) {
			a = module.a;
		}, function (module) {
			d = module.d;
		}],
		execute: (function () {

			console.log(a + d);

		})
	};
}));
