System.register([], function (exports) {
  'use strict';
  return {
    execute: function () {

      class C {
        fn (num) {
          console.log(num - p$1);
        }
      }

      var p = exports('p', 43);

      new C().fn(p);

      class C$1 {
        fn (num) {
          console.log(num - p);
        }
      }

      var p$1 = exports('p2', 42);

      new C$1().fn(p$1);

    }
  };
});
