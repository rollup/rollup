System.register(['./_arrayPush.js', './_baseFlatten.js', './_copyArray.js', './isArray.js'], function (exports, module) {
  'use strict';
  var arrayPush, baseFlatten, copyArray, isArray;
  return {
    setters: [function (module) {
      arrayPush = module.default;
    }, function (module) {
      baseFlatten = module.default;
    }, function (module) {
      copyArray = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

      /**
       * Creates a new array concatenating `array` with any additional arrays
       * and/or values.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to concatenate.
       * @param {...*} [values] The values to concatenate.
       * @returns {Array} Returns the new concatenated array.
       * @example
       *
       * var array = [1];
       * var other = _.concat(array, 2, [3], [[4]]);
       *
       * console.log(other);
       * // => [1, 2, 3, [4]]
       *
       * console.log(array);
       * // => [1]
       */
      function concat() {
        var length = arguments.length;
        if (!length) {
          return [];
        }
        var args = Array(length - 1),
            array = arguments[0],
            index = length;

        while (index--) {
          args[index - 1] = arguments[index];
        }
        return arrayPush(isArray(array) ? copyArray(array) : [array], baseFlatten(args, 1));
      }
      exports('default', concat);

    }
  };
});
