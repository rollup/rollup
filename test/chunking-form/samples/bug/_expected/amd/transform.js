define(['./_arrayEach.js', './_baseCreate.js', './_baseForOwn.js', './_baseIteratee.js', './_getPrototype.js', './isArray.js', './isBuffer.js', './isFunction.js', './isObject.js', './isTypedArray.js'], function (___arrayEach_js, ___baseCreate_js, ___baseForOwn_js, ___baseIteratee_js, ___getPrototype_js, __isArray_js, __isBuffer_js, __isFunction_js, __isObject_js, __isTypedArray_js) { 'use strict';

  /**
   * An alternative to `_.reduce`; this method transforms `object` to a new
   * `accumulator` object which is the result of running each of its own
   * enumerable string keyed properties thru `iteratee`, with each invocation
   * potentially mutating the `accumulator` object. If `accumulator` is not
   * provided, a new object with the same `[[Prototype]]` will be used. The
   * iteratee is invoked with four arguments: (accumulator, value, key, object).
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @since 1.3.0
   * @category Object
   * @param {Object} object The object to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @param {*} [accumulator] The custom accumulator value.
   * @returns {*} Returns the accumulated value.
   * @example
   *
   * _.transform([2, 3, 4], function(result, n) {
   *   result.push(n *= n);
   *   return n % 2 == 0;
   * }, []);
   * // => [4, 9]
   *
   * _.transform({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
   *   (result[value] || (result[value] = [])).push(key);
   * }, {});
   * // => { '1': ['a', 'c'], '2': ['b'] }
   */
  function transform(object, iteratee, accumulator) {
    var isArr = __isArray_js.default(object),
        isArrLike = isArr || __isBuffer_js.default(object) || __isTypedArray_js.default(object);

    iteratee = ___baseIteratee_js.default(iteratee, 4);
    if (accumulator == null) {
      var Ctor = object && object.constructor;
      if (isArrLike) {
        accumulator = isArr ? new Ctor : [];
      }
      else if (__isObject_js.default(object)) {
        accumulator = __isFunction_js.default(Ctor) ? ___baseCreate_js.default(___getPrototype_js.default(object)) : {};
      }
      else {
        accumulator = {};
      }
    }
    (isArrLike ? ___arrayEach_js.default : ___baseForOwn_js.default)(object, function(value, index, object) {
      return iteratee(accumulator, value, index, object);
    });
    return accumulator;
  }

  return transform;

});
