(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	factory(global.bundle = {});
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (exports) { 'use strict';

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

})));
