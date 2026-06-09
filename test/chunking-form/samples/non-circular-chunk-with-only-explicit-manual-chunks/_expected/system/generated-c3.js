System.register(['./generated-c4.js'], (function (exports) {
	'use strict';
	var c4;
	return {
		setters: [function (module) {
			c4 = module.c;
		}],
		execute: (function () {

			console.log('c3');
			const c3 = exports("c", 'c3' + c4);

		})
	};
}));
