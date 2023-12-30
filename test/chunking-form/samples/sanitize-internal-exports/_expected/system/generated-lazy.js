System.register(['./main.js'], (function (exports) {
	'use strict';
	var v1;
	return {
		setters: [function (module) {
			v1 = module.v1;
		}],
		execute: (function () {

			var lazy = exports("default", () => v1);

		})
	};
}));
