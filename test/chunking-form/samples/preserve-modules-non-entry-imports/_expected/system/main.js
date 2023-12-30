System.register(['./dep2.js'], (function (exports) {
	'use strict';
	var foo;
	return {
		setters: [function (module) {
			foo = module.default;
			exports("default", module.default);
		}],
		execute: (function () {



		})
	};
}));
