(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.foo = factory());
})(this, (function () { 'use strict';

  function foo () {
    console.log( 'indented with spaces' );
  }

  return foo;

}));
