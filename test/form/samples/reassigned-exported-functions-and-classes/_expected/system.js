System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports('foo', foo);

			function foo () {}
			exports("foo", foo = 1);

			class bar {} exports("bar", bar);
			exports("bar", bar = 1);

		})
	};
}));
