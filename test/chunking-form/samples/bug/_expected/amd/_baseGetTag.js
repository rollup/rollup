define(['./_Symbol.js', './_getRawTag.js', './_objectToString.js'], function (___Symbol_js, ___getRawTag_js, ___objectToString_js) { 'use strict';

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = ___Symbol_js.default ? ___Symbol_js.default.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? ___getRawTag_js.default(value)
      : ___objectToString_js.default(value);
  }

  return baseGetTag;

});
