'use strict';

var ___arrayMap_js = require('./_arrayMap.js');
var ___baseIteratee_js = require('./_baseIteratee.js');
var ___baseMap_js = require('./_baseMap.js');
var ___baseSortBy_js = require('./_baseSortBy.js');
var ___baseUnary_js = require('./_baseUnary.js');
var ___compareMultiple_js = require('./_compareMultiple.js');
var __identity_js = require('./identity.js');

/**
 * The base implementation of `_.orderBy` without param guards.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
 * @param {string[]} orders The sort orders of `iteratees`.
 * @returns {Array} Returns the new sorted array.
 */
function baseOrderBy(collection, iteratees, orders) {
  var index = -1;
  iteratees = ___arrayMap_js.default(iteratees.length ? iteratees : [__identity_js.default], ___baseUnary_js.default(___baseIteratee_js.default));

  var result = ___baseMap_js.default(collection, function(value, key, collection) {
    var criteria = ___arrayMap_js.default(iteratees, function(iteratee) {
      return iteratee(value);
    });
    return { 'criteria': criteria, 'index': ++index, 'value': value };
  });

  return ___baseSortBy_js.default(result, function(object, other) {
    return ___compareMultiple_js.default(object, other, orders);
  });
}

module.exports = baseOrderBy;
