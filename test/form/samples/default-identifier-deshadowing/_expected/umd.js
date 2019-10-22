(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function a() {
    a = someGlobal;
    return a();
  }

  a();

})));
