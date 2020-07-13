(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('a'), require('b')) :
  typeof define === 'function' && define.amd ? define(['exports', 'a', 'b'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.myBundle = {}, global.a, global.b));
}(this, (function (exports, a, Test$1) { 'use strict';

  function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

  var Test__default = _interopDefault(Test$1);

  const Test = () => {
    console.log(a.Test);
  };

  const Test1 = () => {
    console.log(Test__default['default']);
  };

  exports.Test = Test;
  exports.Test1 = Test1;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
