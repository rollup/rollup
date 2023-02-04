(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('a'), require('b')) :
  typeof define === 'function' && define.amd ? define(['exports', 'a', 'b'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.myBundle = {}, global.a, global.b));
})(this, (function (exports, a, Test$1) { 'use strict';

  const Test = () => {
    console.log(a.Test);
  };

  const Test1 = () => {
    console.log(Test$1);
  };

  exports.Test = Test;
  exports.Test1 = Test1;

}));
