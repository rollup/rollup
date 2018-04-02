(function (global, factory) {
  typeof module === 'object' && module.exports ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

  function foo() {
    return 'foo'
  }

  assert.equal( foo(), 'foo' );

})));
