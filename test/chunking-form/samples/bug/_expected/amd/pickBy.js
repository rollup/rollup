define(['./_arrayMap.js', './_baseIteratee.js', './_basePickBy.js', './_getAllKeysIn.js'], function (___arrayMap_js, ___baseIteratee_js, ___basePickBy_js, ___getAllKeysIn_js) { 'use strict';

  /**
   * Creates an object composed of the `object` properties `predicate` returns
   * truthy for. The predicate is invoked with two arguments: (value, key).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Object
   * @param {Object} object The source object.
   * @param {Function} [predicate=_.identity] The function invoked per property.
   * @returns {Object} Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.pickBy(object, _.isNumber);
   * // => { 'a': 1, 'c': 3 }
   */
  function pickBy(object, predicate) {
    if (object == null) {
      return {};
    }
    var props = ___arrayMap_js.default(___getAllKeysIn_js.default(object), function(prop) {
      return [prop];
    });
    predicate = ___baseIteratee_js.default(predicate);
    return ___basePickBy_js.default(object, props, function(value, path) {
      return predicate(value, path[0]);
    });
  }

  return pickBy;

});
