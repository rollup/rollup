System.register('bundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			const foo = exports('foo', 42);

		}
	};
});
