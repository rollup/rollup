System.register([], function () {
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
