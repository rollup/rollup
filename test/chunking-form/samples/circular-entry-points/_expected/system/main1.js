System.register(['./main2.js'], function (exports, module) {
  'use strict';
  var p$1;
  return {
    setters: [function (module) {
      p$1 = module.p;
    }],
    execute: function () {

      class C {
        fn (num) {
          console.log(num - p$1);
        }
      }

      var p = exports('p', 42);

      new C().fn(p);

    }
  };
});
