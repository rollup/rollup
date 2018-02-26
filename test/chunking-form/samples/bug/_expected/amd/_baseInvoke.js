define(['./_apply.js', './_castPath.js', './last.js', './_parent.js', './_toKey.js'], function (___apply_js, ___castPath_js, __last_js, ___parent_js, ___toKey_js) { 'use strict';

  /**
   * The base implementation of `_.invoke` without support for individual
   * method arguments.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the method to invoke.
   * @param {Array} args The arguments to invoke the method with.
   * @returns {*} Returns the result of the invoked method.
   */
  function baseInvoke(object, path, args) {
    path = ___castPath_js.default(path, object);
    object = ___parent_js.default(object, path);
    var func = object == null ? object : object[___toKey_js.default(__last_js.default(path))];
    return func == null ? undefined : ___apply_js.default(func, object, args);
  }

  return baseInvoke;

});
