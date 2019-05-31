System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports({
        a: fn$1,
        f: fn$2
      });

      function fn () {
        console.log('lib fn');
      }

      function fn$1 () {
        fn();
        console.log(text$1);
        text = exports('b', 'dep1 fn after dep2');
      }

      var text = exports('b', 'dep1 fn');

      function fn$2 () {
        console.log(text);
        text$1 = exports('t', 'dep2 fn after dep1');
      }

      var text$1 = exports('t', 'dep2 fn');

    }
  };
});
