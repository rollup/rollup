System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			const shared1 = exports("shared1", 'shared1');
			const foo$1 = exports("foo", 'foo1');

			var shared2 = exports("shared2", 'shared2');
			const foo = exports("foo$1", 'foo2');

		})
	};
}));
