System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      exports({
        p: void 0,
        q: q
      });

      var p;
      function q () {
        p = exports('p', 10);
      }

    }
  };
});
