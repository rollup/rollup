System.register(['./other.js', './third.js'], (function (exports) {
	'use strict';
	return {
		setters: [null, function (module) {
			exports("foo", module.foo);
		}],
		execute: (function () {



		})
	};
}));
