System.register(['external-module'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("fromExternal", module);
		}],
		execute: (function () {



		})
	};
}));
