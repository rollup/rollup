System.register('bundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports('foo', foo);
			exports('bar', bar);
			exports('baz', baz);
			function foo () {}
			foo = exports('foo', 1);

			var bar = exports('bar', 1);
			function bar () {}

			function baz () {}
			var baz = exports('baz', 1);

			class quux {} exports('quux', quux);
			quux = exports('quux', 1);

		}
	};
});
