'use strict';

var ___apply_js = require('./_apply.js');
var ___arrayMap_js = require('./_arrayMap.js');
var ___baseIteratee_js = require('./_baseIteratee.js');
var ___baseRest_js = require('./_baseRest.js');
var ___baseUnary_js = require('./_baseUnary.js');
var ___flatRest_js = require('./_flatRest.js');

/**
 * Creates a function like `_.over`.
 *
 * @private
 * @param {Function} arrayFunc The function to iterate over iteratees.
 * @returns {Function} Returns the new over function.
 */
function createOver(arrayFunc) {
  return ___flatRest_js.default(function(iteratees) {
    iteratees = ___arrayMap_js.default(iteratees, ___baseUnary_js.default(___baseIteratee_js.default));
    return ___baseRest_js.default(function(args) {
      var thisArg = this;
      return arrayFunc(iteratees, function(iteratee) {
        return ___apply_js.default(iteratee, thisArg, args);
      });
    });
  });
}

module.exports = createOver;
