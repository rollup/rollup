System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      let C$1 = class C {
        fn (num) {
          console.log(num - p);
        }
      };

      var p$1 = exports("p", 43);

      new C$1().fn(p$1);

      class C {
        fn (num) {
          console.log(num - p$1);
        }
      }

      var p = exports("p2", 42);

      new C().fn(p);

    })
  };
}));
