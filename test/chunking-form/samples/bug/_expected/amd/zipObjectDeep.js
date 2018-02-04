define(['./_baseSet.js', './_baseZipObject.js'], function (___baseSet_js, ___baseZipObject_js) { 'use strict';

  /**
   * This method is like `_.zipObject` except that it supports property paths.
   *
   * @static
   * @memberOf _
   * @since 4.1.0
   * @category Array
   * @param {Array} [props=[]] The property identifiers.
   * @param {Array} [values=[]] The property values.
   * @returns {Object} Returns the new object.
   * @example
   *
   * _.zipObjectDeep(['a.b[0].c', 'a.b[1].d'], [1, 2]);
   * // => { 'a': { 'b': [{ 'c': 1 }, { 'd': 2 }] } }
   */
  function zipObjectDeep(props, values) {
    return ___baseZipObject_js.default(props || [], values || [], ___baseSet_js.default);
  }

  return zipObjectDeep;

});
