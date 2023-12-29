System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports("b", broken);

      function broken() {
        console.log('broken');
      }

    })
  };
}));
