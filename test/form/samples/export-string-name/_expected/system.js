System.register('bundle', ['x'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("'", module.x);
		}],
		execute: (function () {



		})
	};
}));
