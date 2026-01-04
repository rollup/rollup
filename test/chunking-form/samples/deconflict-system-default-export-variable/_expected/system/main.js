System.register(['./other.js'], (function (exports) {
	'use strict';
	var main$1;
	return {
		setters: [function (module) {
			main$1 = module.main;
		}],
		execute: (function () {

			var main = exports("default", main$1 + 'extended');

		})
	};
}));
