System.register(['./_baseSet.js', './_baseZipObject.js'], function (exports, module) {
  'use strict';
  var baseSet, baseZipObject;
  return {
    setters: [function (module) {
      baseSet = module.default;
    }, function (module) {
      baseZipObject = module.default;
    }],
    execute: function () {

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
        return baseZipObject(props || [], values || [], baseSet);
      }
      exports('default', zipObjectDeep);

    }
  };
});
