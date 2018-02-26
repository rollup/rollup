define(['./_copyArray.js', './_shuffleSelf.js'], function (___copyArray_js, ___shuffleSelf_js) { 'use strict';

  /**
   * A specialized version of `_.shuffle` for arrays.
   *
   * @private
   * @param {Array} array The array to shuffle.
   * @returns {Array} Returns the new shuffled array.
   */
  function arrayShuffle(array) {
    return ___shuffleSelf_js.default(___copyArray_js.default(array));
  }

  return arrayShuffle;

});
