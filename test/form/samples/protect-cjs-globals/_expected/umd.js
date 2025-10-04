(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}));
})(this, (function (exports) { 'use strict';

	const exports$1 = 1;
	const require$1 = 2;
	const module$1 = 3;
	const __filename$1 = 4;
	const __dirname$1 = 5;

	exports.__dirname = __dirname$1;
	exports.__filename = __filename$1;
	exports.exports = exports$1;
	exports.module = module$1;
	exports.require = require$1;

}));
