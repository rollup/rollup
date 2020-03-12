define(['exports', 'a', 'b'], function (exports, a, Test$1) { 'use strict';

  Test$1 = Test$1 && Object.prototype.hasOwnProperty.call(Test$1, 'default') ? Test$1['default'] : Test$1;

  const Test = () => {
    console.log(a.Test);
  };

  const Test1 = () => {
    console.log(Test$1);
  };

  exports.Test = Test;
  exports.Test1 = Test1;

  Object.defineProperty(exports, '__esModule', { value: true });

});
