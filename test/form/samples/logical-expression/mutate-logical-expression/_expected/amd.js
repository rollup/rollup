define(['exports'], (function (exports) { 'use strict';

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
