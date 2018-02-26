'use strict';

var ___LazyWrapper_js = require('./_LazyWrapper.js');
var ___arrayPush_js = require('./_arrayPush.js');
var ___arrayReduce_js = require('./_arrayReduce.js');

/**
 * The base implementation of `wrapperValue` which returns the result of
 * performing a sequence of actions on the unwrapped `value`, where each
 * successive action is supplied the return value of the previous.
 *
 * @private
 * @param {*} value The unwrapped value.
 * @param {Array} actions Actions to perform to resolve the unwrapped value.
 * @returns {*} Returns the resolved value.
 */
function baseWrapperValue(value, actions) {
  var result = value;
  if (result instanceof ___LazyWrapper_js.default) {
    result = result.value();
  }
  return ___arrayReduce_js.default(actions, function(result, action) {
    return action.func.apply(action.thisArg, ___arrayPush_js.default([result], action.args));
  }, result);
}

module.exports = baseWrapperValue;
