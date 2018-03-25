System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports('foo', foo);
			function foo() {}

		}
	};
});
