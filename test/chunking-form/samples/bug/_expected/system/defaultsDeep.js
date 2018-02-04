System.register(['./_apply.js', './_baseRest.js', './_customDefaultsMerge.js', './mergeWith.js'], function (exports, module) {
  'use strict';
  var apply, baseRest, customDefaultsMerge, mergeWith;
  return {
    setters: [function (module) {
      apply = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      customDefaultsMerge = module.default;
    }, function (module) {
      mergeWith = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.defaults` except that it recursively assigns
       * default properties.
       *
       * **Note:** This method mutates `object`.
       *
       * @static
       * @memberOf _
       * @since 3.10.0
       * @category Object
       * @param {Object} object The destination object.
       * @param {...Object} [sources] The source objects.
       * @returns {Object} Returns `object`.
       * @see _.defaults
       * @example
       *
       * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
       * // => { 'a': { 'b': 2, 'c': 3 } }
       */
      var defaultsDeep = baseRest(function(args) {
        args.push(undefined, customDefaultsMerge);
        return apply(mergeWith, undefined, args);
      });
      exports('defaultsDeep', defaultsDeep);

    }
  };
});
