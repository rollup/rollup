System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			console.log('third');
			const foo = exports('foo', 'foo');
			const bar = exports('bar', 'bar');

		})
	};
}));
