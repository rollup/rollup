System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var x = 42;
			exports('x', x);

		}
	};
});
