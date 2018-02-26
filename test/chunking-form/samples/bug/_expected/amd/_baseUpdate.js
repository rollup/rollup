define(['./_baseGet.js', './_baseSet.js'], function (___baseGet_js, ___baseSet_js) { 'use strict';

  /**
   * The base implementation of `_.update`.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {Array|string} path The path of the property to update.
   * @param {Function} updater The function to produce the updated value.
   * @param {Function} [customizer] The function to customize path creation.
   * @returns {Object} Returns `object`.
   */
  function baseUpdate(object, path, updater, customizer) {
    return ___baseSet_js.default(object, path, updater(___baseGet_js.default(object, path)), customizer);
  }

  return baseUpdate;

});
