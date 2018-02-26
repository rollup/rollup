System.register(['./_LazyWrapper.js', './_LodashWrapper.js', './_baseAt.js', './_flatRest.js', './_isIndex.js', './thru.js'], function (exports, module) {
  'use strict';
  var LazyWrapper, LodashWrapper, baseAt, flatRest, isIndex, thru;
  return {
    setters: [function (module) {
      LazyWrapper = module.default;
    }, function (module) {
      LodashWrapper = module.default;
    }, function (module) {
      baseAt = module.default;
    }, function (module) {
      flatRest = module.default;
    }, function (module) {
      isIndex = module.default;
    }, function (module) {
      thru = module.default;
    }],
    execute: function () {

      /**
       * This method is the wrapper version of `_.at`.
       *
       * @name at
       * @memberOf _
       * @since 1.0.0
       * @category Seq
       * @param {...(string|string[])} [paths] The property paths to pick.
       * @returns {Object} Returns the new `lodash` wrapper instance.
       * @example
       *
       * var object = { 'a': [{ 'b': { 'c': 3 } }, 4] };
       *
       * _(object).at(['a[0].b.c', 'a[1]']).value();
       * // => [3, 4]
       */
      var wrapperAt = flatRest(function(paths) {
        var length = paths.length,
            start = length ? paths[0] : 0,
            value = this.__wrapped__,
            interceptor = function(object) { return baseAt(object, paths); };

        if (length > 1 || this.__actions__.length ||
            !(value instanceof LazyWrapper) || !isIndex(start)) {
          return this.thru(interceptor);
        }
        value = value.slice(start, +start + (length ? 1 : 0));
        value.__actions__.push({
          'func': thru,
          'args': [interceptor],
          'thisArg': undefined
        });
        return new LodashWrapper(value, this.__chain__).thru(function(array) {
          if (length && !array.length) {
            array.push(undefined);
          }
          return array;
        });
      });
      exports('default', wrapperAt);

    }
  };
});
