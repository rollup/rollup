(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = global || self, factory(global.bundle = {}, global.external));
}(this, (function (exports, external) { 'use strict';

	exports.external = external;
	exports.indirect = external;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
