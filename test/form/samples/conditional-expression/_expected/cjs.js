'use strict';

// side-effect in condition
var a = foo() ? 1 : 2;

var unknownValue = bar();

// unknown branch with side-effect
var c = unknownValue ? foo() : 2;
var d = unknownValue ? 1 : foo();
(unknownValue ? function () {} : function () {this.x = 1;})();

// known side-effect
var h1 =  foo() ;
var h2 = ( function () {this.x = 1;} )();
var h3 = ( () => () => console.log( 'effect' ) )()();
var i1 =  foo();
var i2 = ( function () {this.x = 1;})();
var i3 = ( () => () => console.log( 'effect' ))()();
