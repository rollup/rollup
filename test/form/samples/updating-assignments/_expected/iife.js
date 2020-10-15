var bundle = (function (exports) {
	'use strict';

	exports.x = 1;
	exports.x = 2;
	exports.x += 1;
	exports.x -= 1;
	exports.x *= 2;
	exports.x /= 2;
	exports.x %= 2;
	exports.x **= 2;
	exports.x <<= 1;
	exports.x >>= 1;
	exports.x >>>= 1;
	exports.x &= 3;
	exports.x ^= 2;
	exports.x |= 2;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}));
