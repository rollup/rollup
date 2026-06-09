System.register(['./generated-e.js'], (function (exports) {
	'use strict';
	var e;
	return {
		setters: [function (module) {
			e = module.e;
		}],
		execute: (function () {

			console.log('b');
			const b = exports("b", 'b' + e);

		})
	};
}));
