System.register('myBundle', ['x'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("x", module.default);
		}],
		execute: (function () {



		})
	};
}));
