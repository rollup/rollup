System.register(['external'], (function (exports) {
	'use strict';
	var path;
	return {
		setters: [function (module) {
			path = module.default;
			exports("default", module.default);
		}],
		execute: (function () {



		})
	};
}));
