System.register(['./generated-chunk.js'], function (exports, module) {
  'use strict';
  var fn$1;
  return {
    setters: [function (module) {
      fn$1 = module.a;
    }],
    execute: function () {

      function fn () {
        console.log('dep1 fn');
      }

      class Main1 {
        constructor () {
          fn();
          fn$1();
        }
      } exports('default', Main1);

    }
  };
});
//# sourceMappingURL=main1.js.map
