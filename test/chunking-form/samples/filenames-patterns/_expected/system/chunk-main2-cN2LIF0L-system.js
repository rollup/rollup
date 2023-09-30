System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports('l', log);

      var dep = exports('d', { x: 42 });

      function log (x) {
        if (dep) {
          console.log(x);
        }
      }

    })
  };
}));
