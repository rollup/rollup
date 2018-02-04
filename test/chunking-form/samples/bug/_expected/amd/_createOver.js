define(['./_apply.js', './_arrayMap.js', './_baseIteratee.js', './_baseRest.js', './_baseUnary.js', './_flatRest.js'], function (___apply_js, ___arrayMap_js, ___baseIteratee_js, ___baseRest_js, ___baseUnary_js, ___flatRest_js) { 'use strict';

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

  return createOver;

});
