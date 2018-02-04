define(['./_Symbol.js', './_copyArray.js', './_getTag.js', './isArrayLike.js', './isString.js', './_iteratorToArray.js', './_mapToArray.js', './_setToArray.js', './_stringToArray.js', './values.js'], function (___Symbol_js, ___copyArray_js, ___getTag_js, __isArrayLike_js, __isString_js, ___iteratorToArray_js, ___mapToArray_js, ___setToArray_js, ___stringToArray_js, __values_js) { 'use strict';

  /** `Object#toString` result references. */
  var mapTag = '[object Map]',
      setTag = '[object Set]';

  /** Built-in value references. */
  var symIterator = ___Symbol_js.default ? ___Symbol_js.default.iterator : undefined;

  /**
   * Converts `value` to an array.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {Array} Returns the converted array.
   * @example
   *
   * _.toArray({ 'a': 1, 'b': 2 });
   * // => [1, 2]
   *
   * _.toArray('abc');
   * // => ['a', 'b', 'c']
   *
   * _.toArray(1);
   * // => []
   *
   * _.toArray(null);
   * // => []
   */
  function toArray(value) {
    if (!value) {
      return [];
    }
    if (__isArrayLike_js.default(value)) {
      return __isString_js.default(value) ? ___stringToArray_js.default(value) : ___copyArray_js.default(value);
    }
    if (symIterator && value[symIterator]) {
      return ___iteratorToArray_js.default(value[symIterator]());
    }
    var tag = ___getTag_js.default(value),
        func = tag == mapTag ? ___mapToArray_js.default : (tag == setTag ? ___setToArray_js.default : __values_js.default);

    return func(value);
  }

  return toArray;

});
