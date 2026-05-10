System.register(['./generated-c2.js'], (function (exports) {
	'use strict';
	var c2;
	return {
		setters: [function (module) {
			c2 = module.c;
		}],
		execute: (function () {

			console.log('c');
			const c = exports("c", 'c' + c2);

		})
	};
}));
