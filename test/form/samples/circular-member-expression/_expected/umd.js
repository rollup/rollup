(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

  var foo = function() {
    foo.toString = null;
  }.toString();

  console.log(foo);

}));
