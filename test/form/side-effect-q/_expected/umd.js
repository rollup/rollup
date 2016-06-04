(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.myBundle = factory());
}(this, function () { 'use strict';

  class ClassWithSideEffects {
    constructor( arg ) { arg.myBad = 'sorry'; }
  }

  const unusedInstance2 = new ClassWithSideEffects( PublicClass );

  class PublicClass {}

  return PublicClass;

}));