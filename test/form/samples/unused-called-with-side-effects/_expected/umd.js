(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function foo() {
    return 'foo'
  }

  assert.equal( foo(), 'foo' );

})));
