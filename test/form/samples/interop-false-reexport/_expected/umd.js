(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(factory((global.foo = {}),global.external));
}(this, (function (exports,external) { 'use strict';

	exports.q = external.p;
	exports.p = external.default;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
