'use strict';

var ___Symbol_js = require('./_Symbol.js');
var ___getRawTag_js = require('./_getRawTag.js');
var ___objectToString_js = require('./_objectToString.js');

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

module.exports = baseGetTag;
