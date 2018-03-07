(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external-package')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external-package'], factory) :
	(factory((global.iife = {}),global.externalPackage));
}(this, (function (exports,externalPackage) { 'use strict';

	exports.ext = externalPackage;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
