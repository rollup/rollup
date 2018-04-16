System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('a', fn$2);
      exports('b', fn$1);
      function fn () {
        console.log('lib fn');
      }

      function fn$1 () {
        fn();
        console.log(text$1);
      }

      var text$$1 = 'dep1 fn';

      function fn$2 () {
        console.log(text$$1);
      }

      var text$1 = 'dep2 fn';

    }
  };
});
