'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var aExp = {};
var logicalAExp = aExp || {};
logicalAExp.bar = 1;

var bExp = {};
var logicalBExp = false || bExp;
logicalBExp.bar = 1;

var cExp = {};
var logicalCExp = true && cExp;
logicalCExp.bar = 1;

exports.aExp = aExp;
exports.bExp = bExp;
exports.cExp = cExp;
