(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' && !module.nodeType ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  var foo = function() {
    foo.toString = null;
  }.toString();

  console.log(foo);

})));
