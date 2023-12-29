System.register(['./dep.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ __proto__: null, bar: module.foo, foo: module.foo });
		}],
		execute: (function () {



		})
	};
}));
