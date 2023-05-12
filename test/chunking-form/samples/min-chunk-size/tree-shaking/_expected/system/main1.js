System.register([], (function (exports) {
   'use strict';
   return {
      execute: (function () {

         console.log('shared');

         const main = exports('main', 'main');

      })
   };
}));
