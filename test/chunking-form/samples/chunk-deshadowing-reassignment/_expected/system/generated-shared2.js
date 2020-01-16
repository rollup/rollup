System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var x = 42;

			var x$1 = exports('x', x + 1);

			var x$2 = 43;

			var y = exports('y', x$2 + 1);

		}
	};
});
