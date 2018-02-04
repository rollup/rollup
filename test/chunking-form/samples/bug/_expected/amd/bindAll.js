define(['./_arrayEach.js', './_baseAssignValue.js', './bind.js', './_flatRest.js', './_toKey.js'], function (___arrayEach_js, ___baseAssignValue_js, __bind_js, ___flatRest_js, ___toKey_js) { 'use strict';

  /**
   * Binds methods of an object to the object itself, overwriting the existing
   * method.
   *
   * **Note:** This method doesn't set the "length" property of bound functions.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {Object} object The object to bind and assign the bound methods to.
   * @param {...(string|string[])} methodNames The object method names to bind.
   * @returns {Object} Returns `object`.
   * @example
   *
   * var view = {
   *   'label': 'docs',
   *   'click': function() {
   *     console.log('clicked ' + this.label);
   *   }
   * };
   *
   * _.bindAll(view, ['click']);
   * jQuery(element).on('click', view.click);
   * // => Logs 'clicked docs' when clicked.
   */
  var bindAll = ___flatRest_js.default(function(object, methodNames) {
    ___arrayEach_js.default(methodNames, function(key) {
      key = ___toKey_js.default(key);
      ___baseAssignValue_js.default(object, key, __bind_js.default(object[key], object));
    });
    return object;
  });

  return bindAll;

});
