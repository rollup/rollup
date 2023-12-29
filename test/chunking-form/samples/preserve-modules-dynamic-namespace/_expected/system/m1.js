System.register(['./m2.js', './m3.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("m2", module.default);
		}, function (module) {
			exports("m3", module.default);
		}],
		execute: (function () {



		})
	};
}));
