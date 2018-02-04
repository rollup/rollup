define(['./_baseCreate.js', './_getPrototype.js', './_isPrototype.js'], function (___baseCreate_js, ___getPrototype_js, ___isPrototype_js) { 'use strict';

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !___isPrototype_js.default(object))
      ? ___baseCreate_js.default(___getPrototype_js.default(object))
      : {};
  }

  return initCloneObject;

});
