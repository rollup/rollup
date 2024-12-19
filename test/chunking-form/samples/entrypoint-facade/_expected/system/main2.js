System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports("default", log);

      function log (x) {
        {
          console.log(x);
        }
      }

    })
  };
}));
