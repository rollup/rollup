define(['./_baseGet.js'], function (___baseGet_js) { 'use strict';

  /**
   * A specialized version of `baseProperty` which supports deep paths.
   *
   * @private
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new accessor function.
   */
  function basePropertyDeep(path) {
    return function(object) {
      return ___baseGet_js.default(object, path);
    };
  }

  return basePropertyDeep;

});
