System.register([], function (exports) {
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
      }

      var text = 'dep1 fn';

      function fn$2 () {
        console.log(text);
      }

      var text$1 = 'dep2 fn';

    }
  };
});
