System.register(['./generated-e.js'], (function (exports) {
	'use strict';
	var e;
	return {
		setters: [function (module) {
			e = module.e;
		}],
		execute: (function () {

			console.log('c5');
			const c5 = 'c5' + e;

			console.log('c4');
			const c4 = exports("c", 'c4' + c5);

		})
	};
}));
