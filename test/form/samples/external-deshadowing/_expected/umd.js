(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('a'), require('b')) :
  typeof define === 'function' && define.amd ? define(['exports', 'a', 'b'], factory) :
  (global = global || self, factory(global.myBundle = {}, global.a, global.b));
}(this, (function (exports, a, Test$1) { 'use strict';

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

})));
