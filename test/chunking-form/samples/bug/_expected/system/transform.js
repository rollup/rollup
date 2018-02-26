System.register(['./_arrayEach.js', './_baseCreate.js', './_baseForOwn.js', './_baseIteratee.js', './_getPrototype.js', './isArray.js', './isBuffer.js', './isFunction.js', './isObject.js', './isTypedArray.js'], function (exports, module) {
  'use strict';
  var arrayEach, baseCreate, baseForOwn, baseIteratee, getPrototype, isArray, isBuffer, isFunction, isObject, isTypedArray;
  return {
    setters: [function (module) {
      arrayEach = module.default;
    }, function (module) {
      baseCreate = module.default;
    }, function (module) {
      baseForOwn = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      getPrototype = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      isBuffer = module.default;
    }, function (module) {
      isFunction = module.default;
    }, function (module) {
      isObject = module.default;
    }, function (module) {
      isTypedArray = module.default;
    }],
    execute: function () {

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
        var isArr = isArray(object),
            isArrLike = isArr || isBuffer(object) || isTypedArray(object);

        iteratee = baseIteratee(iteratee, 4);
        if (accumulator == null) {
          var Ctor = object && object.constructor;
          if (isArrLike) {
            accumulator = isArr ? new Ctor : [];
          }
          else if (isObject(object)) {
            accumulator = isFunction(Ctor) ? baseCreate(getPrototype(object)) : {};
          }
          else {
            accumulator = {};
          }
        }
        (isArrLike ? arrayEach : baseForOwn)(object, function(value, index, object) {
          return iteratee(accumulator, value, index, object);
        });
        return accumulator;
      }
      exports('default', transform);

    }
  };
});
