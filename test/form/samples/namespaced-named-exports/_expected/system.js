System.register('foo.bar.baz', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var answer = exports("answer", 42);

		})
	};
}));
