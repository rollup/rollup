System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports('q', q);

      var p; exports("p", p);
      function q () {
        exports("p", p = 10);
      }

    })
  };
}));
