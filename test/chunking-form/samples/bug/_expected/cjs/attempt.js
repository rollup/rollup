'use strict';

var ___apply_js = require('./_apply.js');
var ___baseRest_js = require('./_baseRest.js');
var __isError_js = require('./isError.js');

/**
 * Attempts to invoke `func`, returning either the result or the caught error
 * object. Any additional arguments are provided to `func` when it's invoked.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Util
 * @param {Function} func The function to attempt.
 * @param {...*} [args] The arguments to invoke `func` with.
 * @returns {*} Returns the `func` result or error object.
 * @example
 *
 * // Avoid throwing errors for invalid selectors.
 * var elements = _.attempt(function(selector) {
 *   return document.querySelectorAll(selector);
 * }, '>_>');
 *
 * if (_.isError(elements)) {
 *   elements = [];
 * }
 */
var attempt = ___baseRest_js.default(function(func, args) {
  try {
    return ___apply_js.default(func, undefined, args);
  } catch (e) {
    return __isError_js.default(e) ? e : new Error(e);
  }
});

module.exports = attempt;
