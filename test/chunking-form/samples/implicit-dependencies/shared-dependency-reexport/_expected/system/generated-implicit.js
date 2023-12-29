System.register(['./main.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("foo", module.foo);
		}],
		execute: (function () {



		})
	};
}));
