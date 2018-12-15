(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  factory(global.iife = {});
}(typeof self !== 'undefined' ? self : this, function (exports) { 'use strict';

  function update () {
    exports.foo += 10;
  }

  exports.foo = 10;

  function update$1 () {
    exports.bar++;
  }

  exports.bar = 10;

  function update$2 () {
    ++exports.baz;
  }

  exports.baz = 10;

  console.log(exports.foo);
  update();
  console.log(exports.foo);
  console.log(exports.bar);
  update$1();
  console.log(exports.bar);
  console.log(exports.baz);
  update$2();
  console.log(exports.baz);

  exports.updateFoo = update;
  exports.updateBar = update$1;
  exports.updateBaz = update$2;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
