System.register('foo.bar.baz', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var main = exports("default", 42);

		})
	};
}));
