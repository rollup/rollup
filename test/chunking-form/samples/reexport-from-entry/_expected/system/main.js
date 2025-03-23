System.register(['./otherEntry.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ a: module.a, c: module.c });
		}],
		execute: (function () {



		})
	};
}));
