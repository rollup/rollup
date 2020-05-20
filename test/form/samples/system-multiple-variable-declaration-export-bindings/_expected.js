System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			let a = 123, b = exports('b', 456);
			exports({ a: a, c: a });

		}
	};
});
