(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}));
})(this, (function (exports) { 'use strict';

	var aExp = {};
	var logicalAExp = aExp || {};
	logicalAExp.bar = 1;

	var bExp = {};
	var logicalBExp = bExp;
	logicalBExp.bar = 1;

	var cExp = {};
	var logicalCExp = cExp;
	logicalCExp.bar = 1;

	exports.aExp = aExp;
	exports.bExp = bExp;
	exports.cExp = cExp;

}));
