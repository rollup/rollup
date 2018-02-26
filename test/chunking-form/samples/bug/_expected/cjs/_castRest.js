'use strict';

var ___baseRest_js = require('./_baseRest.js');

/**
 * A `baseRest` alias which can be replaced with `identity` by module
 * replacement plugins.
 *
 * @private
 * @type {Function}
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */
var castRest = ___baseRest_js.default;

module.exports = castRest;
