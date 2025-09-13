System.register(['./generated-vendor.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("bar", module.b);
		}],
		execute: (function () {

			const value1 = exports("value1", 'lib1-value');

			const value2 = exports("value2", 'lib2-value');

		})
	};
}));
