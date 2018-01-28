(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bundle = {})));
}(this, (function (exports) { 'use strict';

	var aExp = {};
	var logicalAExp = aExp || true;
	logicalAExp.bar = 1;

	var bExp = {};

	var cExp = {};
	var logicalCExp = false || cExp;
	logicalCExp.bar = 1;

	var dExp = {};
	var logicalDExp = true && dExp;
	logicalDExp.bar = 1;

	var eExp = {};

	exports.aExp = aExp;
	exports.bExp = bExp;
	exports.cExp = cExp;
	exports.dExp = dExp;
	exports.eExp = eExp;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
