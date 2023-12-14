System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      let C$1 = class C {
        fn (num) {
          console.log(num - p);
        }
      }; exports("C", C$1);

      var p$1 = exports("p", 43);

      new C$1().fn(p$1);

      class C {
        fn (num) {
          console.log(num - p$1);
        }
      }

      var p = exports("a", 42);

      new C().fn(p);

    })
  };
}));
