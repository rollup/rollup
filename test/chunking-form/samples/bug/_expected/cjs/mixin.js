'use strict';

var ___arrayEach_js = require('./_arrayEach.js');
var ___arrayPush_js = require('./_arrayPush.js');
var ___baseFunctions_js = require('./_baseFunctions.js');
var ___copyArray_js = require('./_copyArray.js');
var __isFunction_js = require('./isFunction.js');
var __isObject_js = require('./isObject.js');
var __keys_js = require('./keys.js');

/**
 * Adds all own enumerable string keyed function properties of a source
 * object to the destination object. If `object` is a function, then methods
 * are added to its prototype as well.
 *
 * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
 * avoid conflicts caused by modifying the original.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {Function|Object} [object=lodash] The destination object.
 * @param {Object} source The object of functions to add.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.chain=true] Specify whether mixins are chainable.
 * @returns {Function|Object} Returns `object`.
 * @example
 *
 * function vowels(string) {
 *   return _.filter(string, function(v) {
 *     return /[aeiou]/i.test(v);
 *   });
 * }
 *
 * _.mixin({ 'vowels': vowels });
 * _.vowels('fred');
 * // => ['e']
 *
 * _('fred').vowels().value();
 * // => ['e']
 *
 * _.mixin({ 'vowels': vowels }, { 'chain': false });
 * _('fred').vowels();
 * // => ['e']
 */
function mixin(object, source, options) {
  var props = __keys_js.default(source),
      methodNames = ___baseFunctions_js.default(source, props);

  var chain = !(__isObject_js.default(options) && 'chain' in options) || !!options.chain,
      isFunc = __isFunction_js.default(object);

  ___arrayEach_js.default(methodNames, function(methodName) {
    var func = source[methodName];
    object[methodName] = func;
    if (isFunc) {
      object.prototype[methodName] = function() {
        var chainAll = this.__chain__;
        if (chain || chainAll) {
          var result = object(this.__wrapped__),
              actions = result.__actions__ = ___copyArray_js.default(this.__actions__);

          actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
          result.__chain__ = chainAll;
          return result;
        }
        return func.apply(object, ___arrayPush_js.default([this.value()], arguments));
      };
    }
  });

  return object;
}

module.exports = mixin;
