System.register(['./generated-dep4.js'], function (exports, module) {
  'use strict';
  var multiplier;
  return {
    setters: [function (module) {
      multiplier = module.m;
    }],
    execute: function () {

      function calc (num) {
        return num * multiplier;
      }

      function fn (num) {
        return num * calc(num);
      }

      function dynamic (num) {
        return module.import('./generated-dep2.js')
        .then(dep2 => {
          return dep2.mult(num);
        });
      }

      console.log(fn(5));

      dynamic(10).then(num => {
        console.log(num);
      });

    }
  };
});
