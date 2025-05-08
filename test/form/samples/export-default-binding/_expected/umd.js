(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.myBundle = factory(global.myBundle = {}));
})(this, (function (exports) { 'use strict';

	exports.default = 0;
	console.log(exports.default);
	exports.default = 1;

	return exports.default;

}));
