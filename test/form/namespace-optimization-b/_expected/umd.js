(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(this, function () { 'use strict';

  function foo() {
  };

  function a() {
    foo();
    foo();
    var a;
    if (a.b) {
    }
  }
  a();

}));
