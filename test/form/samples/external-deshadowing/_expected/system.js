System.register('myBundle', ['a', 'b'], function (exports) {
  'use strict';
  var Test$1, Test$1$1;
  return {
    setters: [function (module) {
      Test$1 = module.Test;
    }, function (module) {
      Test$1$1 = module.default;
    }],
    execute: function () {

      const Test = exports('Test', () => {
        console.log(Test$1);
      });

      const Test1 = exports('Test1', () => {
        console.log(Test$1$1);
      });

    }
  };
});
