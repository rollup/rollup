System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('b', broken);

      function broken() {
        console.log('broken');
      }

    }
  };
});
