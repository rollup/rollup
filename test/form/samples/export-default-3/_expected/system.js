System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var bar = 1;

			exports('default', bar);

		}
	};
});
