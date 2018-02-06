(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(factory((global.myBundle = {}),global.external));
}(this, (function (exports,external) { 'use strict';

	exports.s = external.p;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
