System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('fn', fn$1);
      function fn () {
        console.log('lib2 fn');
      }

      function fn$1 () {
        fn();
        console.log('dep2 fn');
      }

    }
  };
});
//# sourceMappingURL=chunk-ff89a1a3.js.map
