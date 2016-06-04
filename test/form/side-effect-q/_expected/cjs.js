'use strict';

class ClassWithSideEffects {
  constructor( arg ) { arg.myBad = 'sorry'; }
}

const unusedInstance2 = new ClassWithSideEffects( PublicClass );

class PublicClass {}

module.exports = PublicClass;