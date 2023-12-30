System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports({
        a: fn$1,
        f: fn
      });

      function fn$2 () {
        console.log('lib fn');
      }

      function fn$1 () {
        fn$2();
        console.log(text);
        exports("b", text$1 = 'dep1 fn after dep2');
      }

      var text$1 = exports("b", 'dep1 fn');

      function fn () {
        console.log(text$1);
        exports("t", text = 'dep2 fn after dep1');
      }

      var text = exports("t", 'dep2 fn');

    })
  };
}));
