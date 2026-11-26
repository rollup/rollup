System.register('myBundle', ['a', 'b'], (function (exports) {
  'use strict';
  var Test$1, Test$2;
  return {
    setters: [function (module) {
      Test$1 = module.Test;
    }, function (module) {
      Test$2 = module.default;
    }],
    execute: (function () {

      const Test = () => {
        console.log(Test$1);
      }; exports("Test", Test);

      const Test1 = () => {
        console.log(Test$2);
      }; exports("Test1", Test1);

    })
  };
}));
