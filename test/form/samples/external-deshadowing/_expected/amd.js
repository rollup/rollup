define(['exports', 'a', 'b'], function (exports, a, Test) { 'use strict';

  Test = Test && Test.hasOwnProperty('default') ? Test['default'] : Test;

  const Test$1 = () => {
    console.log(a.Test);
  };

  const Test1 = () => {
    console.log(Test);
  };

  exports.Test = Test$1;
  exports.Test1 = Test1;

  Object.defineProperty(exports, '__esModule', { value: true });

});
