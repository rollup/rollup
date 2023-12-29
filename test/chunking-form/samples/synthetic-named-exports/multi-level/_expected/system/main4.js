System.register(['./main.js'], (function (exports) {
	'use strict';
	var main;
	return {
		setters: [function (module) {
			main = module.default;
		}],
		execute: (function () {



			exports("default", main.one.two.three);

		})
	};
}));
