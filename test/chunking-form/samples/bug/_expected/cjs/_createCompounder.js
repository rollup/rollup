'use strict';

var ___arrayReduce_js = require('./_arrayReduce.js');
var __deburr_js = require('./deburr.js');
var __words_js = require('./words.js');

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

module.exports = createCompounder;
