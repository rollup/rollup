'use strict';

var ___baseDelay_js = require('./_baseDelay.js');
var ___baseRest_js = require('./_baseRest.js');
var __toNumber_js = require('./toNumber.js');

/**
 * Invokes `func` after `wait` milliseconds. Any additional arguments are
 * provided to `func` when it's invoked.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to delay.
 * @param {number} wait The number of milliseconds to delay invocation.
 * @param {...*} [args] The arguments to invoke `func` with.
 * @returns {number} Returns the timer id.
 * @example
 *
 * _.delay(function(text) {
 *   console.log(text);
 * }, 1000, 'later');
 * // => Logs 'later' after one second.
 */
var delay = ___baseRest_js.default(function(func, wait, args) {
  return ___baseDelay_js.default(func, __toNumber_js.default(wait) || 0, args);
});

module.exports = delay;
