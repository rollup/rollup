System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('a', broken);

      function broken() {
        console.log('broken');
      }

    }
  };
});
