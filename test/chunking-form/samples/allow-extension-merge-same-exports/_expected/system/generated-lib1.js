System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const bar = exports("bar", 'vendor-bar');

			const value1 = exports("value1", 'lib1-value');

			const value2 = exports("value2", 'lib2-value');

		})
	};
}));
