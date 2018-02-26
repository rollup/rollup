'use strict';

var ___baseProperty_js = require('./_baseProperty.js');
var ___basePropertyDeep_js = require('./_basePropertyDeep.js');
var ___isKey_js = require('./_isKey.js');
var ___toKey_js = require('./_toKey.js');

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return ___isKey_js.default(path) ? ___baseProperty_js.default(___toKey_js.default(path)) : ___basePropertyDeep_js.default(path);
}

module.exports = property;
