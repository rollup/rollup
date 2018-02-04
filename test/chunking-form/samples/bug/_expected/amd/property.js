define(['./_baseProperty.js', './_basePropertyDeep.js', './_isKey.js', './_toKey.js'], function (___baseProperty_js, ___basePropertyDeep_js, ___isKey_js, ___toKey_js) { 'use strict';

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

  return property;

});
