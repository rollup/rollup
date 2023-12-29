System.register(['./1.js', './2.js', './3.js', './4.js', './5.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("x1", module.x1);
		}, function (module) {
			exports("x2", module.x2);
		}, function (module) {
			exports("x3", module.x3);
		}, function (module) {
			exports("x4", module.x4);
		}, function (module) {
			exports("x5", module.x5);
		}],
		execute: (function () {



		})
	};
}));
