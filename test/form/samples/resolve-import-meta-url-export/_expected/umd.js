(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.bundle = {}));
}(this, (function (exports) { 'use strict';

	const url = 'url';
	const meta = 'meta';

	exports.meta = meta;
	exports.url = url;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
