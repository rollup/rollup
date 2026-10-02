System.register(['./generated-x.js'], (function (exports) {
	'use strict';
	var x;
	return {
		setters: [function (module) {
			x = module.x;
		}],
		execute: (function () {

			const a = exports("a", 'a' + x);

		})
	};
}));
