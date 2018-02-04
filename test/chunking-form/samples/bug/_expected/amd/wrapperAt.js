define(['./_LazyWrapper.js', './_LodashWrapper.js', './_baseAt.js', './_flatRest.js', './_isIndex.js', './thru.js'], function (___LazyWrapper_js, ___LodashWrapper_js, ___baseAt_js, ___flatRest_js, ___isIndex_js, __thru_js) { 'use strict';

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
  var wrapperAt = ___flatRest_js.default(function(paths) {
    var length = paths.length,
        start = length ? paths[0] : 0,
        value = this.__wrapped__,
        interceptor = function(object) { return ___baseAt_js.default(object, paths); };

    if (length > 1 || this.__actions__.length ||
        !(value instanceof ___LazyWrapper_js.default) || !___isIndex_js.default(start)) {
      return this.thru(interceptor);
    }
    value = value.slice(start, +start + (length ? 1 : 0));
    value.__actions__.push({
      'func': __thru_js.default,
      'args': [interceptor],
      'thisArg': undefined
    });
    return new ___LodashWrapper_js.default(value, this.__chain__).thru(function(array) {
      if (length && !array.length) {
        array.push(undefined);
      }
      return array;
    });
  });

  return wrapperAt;

});
