System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const shared1 = exports('s', 'shared1');
			const foo = exports('f', 'foo1');

			var shared2 = exports('a', 'shared2');
			const foo$1 = exports('b', 'foo2');

		}
	};
});
