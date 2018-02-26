'use strict';

var ___baseInverter_js = require('./_baseInverter.js');

/**
 * Creates a function like `_.invertBy`.
 *
 * @private
 * @param {Function} setter The function to set accumulator values.
 * @param {Function} toIteratee The function to resolve iteratees.
 * @returns {Function} Returns the new inverter function.
 */
function createInverter(setter, toIteratee) {
  return function(object, iteratee) {
    return ___baseInverter_js.default(object, setter, toIteratee(iteratee), {});
  };
}

module.exports = createInverter;
