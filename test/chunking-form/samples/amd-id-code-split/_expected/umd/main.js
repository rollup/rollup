(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define('something/main', ['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.outputName = {}));
}(this, (function (exports) { 'use strict';

	const something = 42;

	exports.something = something;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
