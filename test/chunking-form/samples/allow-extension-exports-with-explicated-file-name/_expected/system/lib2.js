System.register(['./lib1.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("value2", module.v);
		}],
		execute: (function () {



		})
	};
}));
