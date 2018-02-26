define(['./_apply.js', './_baseRest.js', './_customDefaultsMerge.js', './mergeWith.js'], function (___apply_js, ___baseRest_js, ___customDefaultsMerge_js, __mergeWith_js) { 'use strict';

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
  var defaultsDeep = ___baseRest_js.default(function(args) {
    args.push(undefined, ___customDefaultsMerge_js.default);
    return ___apply_js.default(__mergeWith_js.default, undefined, args);
  });

  return defaultsDeep;

});
