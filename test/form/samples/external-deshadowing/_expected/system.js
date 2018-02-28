System.register(['a', 'b'], function (exports, module) {
  'use strict';
  var Test, Test$1;
  return {
    setters: [function (module) {
      Test = module.Test;
    }, function (module) {
      Test$1 = module.default;
    }],
    execute: function () {

      const Test$2 = exports('Test', () => {
        console.log(Test);
      });

      const Test1 = exports('Test1', () => {
        console.log(Test$1);
      });

    }
  };
});
