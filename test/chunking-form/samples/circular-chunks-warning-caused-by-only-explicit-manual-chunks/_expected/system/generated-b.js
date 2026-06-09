System.register(['./generated-ac.js'], (function (exports) {
	'use strict';
	var c;
	return {
		setters: [function (module) {
			c = module.c;
		}],
		execute: (function () {

			const b = exports("b", 'b');
			console.log(b + c);

		})
	};
}));
