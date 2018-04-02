(function (global, factory) {
  typeof module === 'object' && module.exports ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  var foo = function() {
    foo.toString = null;
  }.toString();

  console.log(foo);

})));
