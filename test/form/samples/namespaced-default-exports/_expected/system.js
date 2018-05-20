System.register('foo.bar.baz', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var main = exports('default', 42);

		}
	};
});
