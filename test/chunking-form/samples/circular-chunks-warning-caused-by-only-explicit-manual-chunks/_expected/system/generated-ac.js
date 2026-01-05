System.register(['./main.js'], (function (exports) {
	'use strict';
	var b;
	return {
		setters: [function (module) {
			b = module.b;
		}],
		execute: (function () {

			const c = exports("c", 'c');
			console.log(c);

			const a = exports("a", 'a');
			console.log(a + b);

		})
	};
}));
