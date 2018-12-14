(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  var foo = function() {
    foo.toString = null;
  }.toString();

  console.log(foo);

}));
