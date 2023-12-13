System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var foo = exports("foo", 1);
			var bar = exports("bar", 2);

		})
	};
}));
