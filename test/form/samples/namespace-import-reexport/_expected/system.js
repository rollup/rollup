System.register('iife', ['external-package'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("ext", module);
		}],
		execute: (function () {



		})
	};
}));
