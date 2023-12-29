System.register(['./main.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("value", module.s);
		}],
		execute: (function () {

			const extra = exports("extra", 'extra');

		})
	};
}));
