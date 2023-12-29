System.register(['./dep.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("value", module.default);
		}],
		execute: (function () {



		})
	};
}));
