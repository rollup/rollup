System.register(['./_assignValue.js', './_baseZipObject.js'], function (exports, module) {
  'use strict';
  var assignValue, baseZipObject;
  return {
    setters: [function (module) {
      assignValue = module.default;
    }, function (module) {
      baseZipObject = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.fromPairs` except that it accepts two arrays,
       * one of property identifiers and one of corresponding values.
       *
       * @static
       * @memberOf _
       * @since 0.4.0
       * @category Array
       * @param {Array} [props=[]] The property identifiers.
       * @param {Array} [values=[]] The property values.
       * @returns {Object} Returns the new object.
       * @example
       *
       * _.zipObject(['a', 'b'], [1, 2]);
       * // => { 'a': 1, 'b': 2 }
       */
      function zipObject(props, values) {
        return baseZipObject(props || [], values || [], assignValue);
      }
      exports('default', zipObject);

    }
  };
});
