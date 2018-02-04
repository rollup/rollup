'use strict';

var __isPlainObject_js = require('./isPlainObject.js');

/**
 * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
 * objects.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {string} key The key of the property to inspect.
 * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
 */
function customOmitClone(value) {
  return __isPlainObject_js.default(value) ? undefined : value;
}

module.exports = customOmitClone;
