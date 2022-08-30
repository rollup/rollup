(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.iife = {}));
})(this, (function (exports) { 'use strict';

  function update$2 () {
    exports.foo += 10;
  }

  exports.foo = 10;

  function update$1 () {
    exports.bar++;
  }

  exports.bar = 10;

  function update () {
    ++exports.baz;
  }

  exports.baz = 10;

  console.log(exports.foo);
  update$2();
  console.log(exports.foo);
  console.log(exports.bar);
  update$1();
  console.log(exports.bar);
  console.log(exports.baz);
  update();
  console.log(exports.baz);

  exports.updateBar = update$1;
  exports.updateBaz = update;
  exports.updateFoo = update$2;

}));
