System.register(['./main2.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("p", module.a);
		}],
		execute: (function () {



		})
	};
}));
