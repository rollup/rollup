System.register([], (function (exports, module) {
  'use strict';
  return {
    execute: (function () {

      module.import('./generated-dep.js').then(({ obj }) => {
        console.log(obj.a);
      });

    })
  };
}));
