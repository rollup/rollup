System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports('f', foo);

			function foo() {}

		}
	};
});
