'use strict';

var ___assignValue_js = require('./_assignValue.js');
var ___baseAssignValue_js = require('./_baseAssignValue.js');

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      ___baseAssignValue_js.default(object, key, newValue);
    } else {
      ___assignValue_js.default(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;
