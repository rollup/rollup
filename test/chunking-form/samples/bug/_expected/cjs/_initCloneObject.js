'use strict';

var ___baseCreate_js = require('./_baseCreate.js');
var ___getPrototype_js = require('./_getPrototype.js');
var ___isPrototype_js = require('./_isPrototype.js');

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !___isPrototype_js.default(object))
    ? ___baseCreate_js.default(___getPrototype_js.default(object))
    : {};
}

module.exports = initCloneObject;
