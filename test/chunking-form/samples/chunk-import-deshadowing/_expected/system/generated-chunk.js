System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('a', emptyFunction);

      function emptyFunction () {

      }

    }
  };
});
