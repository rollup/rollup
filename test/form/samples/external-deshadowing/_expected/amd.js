define(['exports', 'a', 'b'], (function (exports, a, Test$1) { 'use strict';

  const Test = () => {
    console.log(a.Test);
  };

  const Test1 = () => {
    console.log(Test$1);
  };

  exports.Test = Test;
  exports.Test1 = Test1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
