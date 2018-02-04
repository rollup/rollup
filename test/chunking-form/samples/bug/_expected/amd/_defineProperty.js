define(['./_getNative.js'], function (___getNative_js) { 'use strict';

  var defineProperty = (function() {
    try {
      var func = ___getNative_js.default(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  return defineProperty;

});
