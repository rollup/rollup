System.register(['./answer.num.js', './lorem.str.js', './no-ext.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("answer", module.default);
		}, function (module) {
			exports("lorem", module.default);
		}, function (module) {
			exports("noExt", module.default);
		}],
		execute: (function () {



		})
	};
}));
