(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external1'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external1', 'external2'], factory) :
	(global = global || self, factory(global.bundle = {}, global.external1, global.external2));
}(this, (function (exports, imported1, external2) { 'use strict';

	console.log(imported1, external2.imported2);

	exports.external1 = imported1;
	exports.external2 = external2;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
