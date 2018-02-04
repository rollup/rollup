System.register(['./_Set.js', './noop.js', './_setToArray.js'], function (exports, module) {
  'use strict';
  var Set, noop, setToArray;
  return {
    setters: [function (module) {
      Set = module.default;
    }, function (module) {
      noop = module.default;
    }, function (module) {
      setToArray = module.default;
    }],
    execute: function () {

      /** Used as references for various `Number` constants. */
      var INFINITY = 1 / 0;

      /**
       * Creates a set object of `values`.
       *
       * @private
       * @param {Array} values The values to add to the set.
       * @returns {Object} Returns the new set.
       */
      var createSet = !(Set && (1 / setToArray(new Set([,-0]))[1]) == INFINITY) ? noop : function(values) {
        return new Set(values);
      };
      exports('default', createSet);

    }
  };
});
