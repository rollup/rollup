define(['./_arrayReduce.js', './deburr.js', './words.js'], function (___arrayReduce_js, __deburr_js, __words_js) { 'use strict';

  /** Used to compose unicode capture groups. */
  var rsApos = "['\u2019]";

  /** Used to match apostrophes. */
  var reApos = RegExp(rsApos, 'g');

  /**
   * Creates a function like `_.camelCase`.
   *
   * @private
   * @param {Function} callback The function to combine each word.
   * @returns {Function} Returns the new compounder function.
   */
  function createCompounder(callback) {
    return function(string) {
      return ___arrayReduce_js.default(__words_js.default(__deburr_js.default(string).replace(reApos, '')), callback, '');
    };
  }

  return createCompounder;

});
