System.register('foo', ['external'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ p: module["default"], q: module.p });
		}],
		execute: (function () {



		})
	};
}));
