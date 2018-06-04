System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      function a() {
        a = someGlobal;
        return a();
      }

      a();

    }
  };
});
