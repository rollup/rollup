System.register(['./main2.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("p", module.p2);
		}],
		execute: (function () {



		})
	};
}));
