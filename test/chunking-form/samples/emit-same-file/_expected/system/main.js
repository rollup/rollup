System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports('hi', hi);

			function hi() { return 2 }

		}
	};
});
