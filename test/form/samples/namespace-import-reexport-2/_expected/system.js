System.register('iife', ['external1', 'external2'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("x", module.x);
		}, function (module) {
			exports("ext", module);
		}],
		execute: (function () {



		})
	};
}));
