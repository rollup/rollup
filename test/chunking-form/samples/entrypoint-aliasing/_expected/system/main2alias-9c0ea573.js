System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('log', log);
      var dep = exports('dep', { x: 42 })

      function log (x) {
        if (dep) {
          console.log(x);
        }
      }

    }
  };
});
