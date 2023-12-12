System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			let x = exports("x", 1);
			exports("x", x = 2);
			exports("x", x += 1);
			exports("x", x -= 1);
			exports("x", x *= 2);
			exports("x", x /= 2);
			exports("x", x %= 2);
			exports("x", x **= 2);
			exports("x", x <<= 1);
			exports("x", x >>= 1);
			exports("x", x >>>= 1);
			exports("x", x &= 3);
			exports("x", x ^= 2);
			exports("x", x |= 2);

		})
	};
}));
