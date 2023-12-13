System.register(['./b.js'], (function (exports) {
	'use strict';
	var b;
	return {
		setters: [function (module) {
			b = module.b;
		}],
		execute: (function () {

			const d = exports("d", b + 4);

		})
	};
}));
