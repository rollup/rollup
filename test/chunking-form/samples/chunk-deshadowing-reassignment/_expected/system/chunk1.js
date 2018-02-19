System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var x = 42;
			exports('a', x);

		}
	};
});
