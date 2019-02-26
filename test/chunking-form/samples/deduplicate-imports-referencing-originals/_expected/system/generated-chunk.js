System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const foo = exports('a', {});

			exports('b', foo);

		}
	};
});
