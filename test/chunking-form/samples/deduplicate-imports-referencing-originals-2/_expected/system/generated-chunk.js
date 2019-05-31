System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const foo = {};

			exports('f', foo);

			exports('b', foo);

		}
	};
});
