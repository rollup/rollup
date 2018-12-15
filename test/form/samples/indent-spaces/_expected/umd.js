(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.foo = factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

  function foo () {
  	console.log( 'indented with tabs' );
  }

  return foo;

}));
