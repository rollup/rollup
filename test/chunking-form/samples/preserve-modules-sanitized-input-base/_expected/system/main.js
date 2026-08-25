System.register(['./helper.js'], (function (exports) {
	'use strict';
	var helper;
	return {
		setters: [function (module) {
			helper = module.helper;
			exports("default", module.helper);
		}],
		execute: (function () {



		})
	};
}));
