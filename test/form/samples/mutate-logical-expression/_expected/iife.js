var bundle = (function (exports) {
	'use strict';

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

	return exports;

}({}));
