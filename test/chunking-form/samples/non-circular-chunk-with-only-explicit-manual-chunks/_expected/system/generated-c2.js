System.register(['./generated-c3.js'], (function (exports) {
	'use strict';
	var c3;
	return {
		setters: [function (module) {
			c3 = module.c;
		}],
		execute: (function () {

			console.log('c2');
			const c2 = exports("c", 'c2' + c3);

		})
	};
}));
