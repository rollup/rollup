System.register('bundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			let x = exports('x', 1);
			x = exports('x', 2);
			x = exports('x', x + 1);
			x = exports('x', x - 1);
			x = exports('x', x * 2);
			x = exports('x', x / 2);
			x = exports('x', x % 2);
			x = exports('x', x ** 2);
			x = exports('x', x << 1);
			x = exports('x', x >> 1);
			x = exports('x', x >>> 1);
			x = exports('x', x & 3);
			x = exports('x', x ^ 2);
			x = exports('x', x | 2);

		}
	};
});
