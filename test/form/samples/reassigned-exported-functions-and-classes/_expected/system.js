System.register('bundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports('foo', foo);

			function foo () {}
			foo = exports('foo', 1);

			class bar {} exports('bar', bar);
			bar = exports('bar', 1);

		}
	};
});
