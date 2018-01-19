System.register(['./main1.js'], function (exports, module) {
  'use strict';
  var p;
  return {
    setters: [function (module) {
      p = module.p;
    }],
    execute: function () {

      class C {
        fn (num) {
          console.log(num - p);
        }
      }

      var p$1 = exports('p', 43);

      new C().fn(p$1);

    }
  };
});
