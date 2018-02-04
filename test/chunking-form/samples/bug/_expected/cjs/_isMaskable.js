'use strict';

var ___coreJsData_js = require('./_coreJsData.js');
var __isFunction_js = require('./isFunction.js');
var __stubFalse_js = require('./stubFalse.js');

/**
 * Checks if `func` is capable of being masked.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `func` is maskable, else `false`.
 */
var isMaskable = ___coreJsData_js.default ? __isFunction_js.default : __stubFalse_js.default;

module.exports = isMaskable;
