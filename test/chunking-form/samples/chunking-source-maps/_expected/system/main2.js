System.register(['./chunk-ff89a1a3.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.fn;
    }],
    execute: function () {

      function fn$1 () {
        console.log('lib1 fn');
      }

      function fn$2 () {
        fn$1();
        console.log('dep3 fn');
      }

      class Main2 {
        constructor () {
          fn$2();
          fn();
        }
      } exports('default', Main2);

    }
  };
});
//# sourceMappingURL=main2.js.map
