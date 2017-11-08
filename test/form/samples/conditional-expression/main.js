// side-effect in condition
var a = foo() ? 1 : 2;

var unknownValue = bar();

// unknown branch without side-effects
var b = unknownValue ? 1 : 2;
new (unknownValue ? function () {} : function () {this.x = 1;})();
(unknownValue ? () => () => {} : () => () => {})()();

// unknown branch with side-effect
var c = unknownValue ? foo() : 2;
var d = unknownValue ? 1 : foo();
(unknownValue ? function () {} : function () {this.x = 1;})();

// no side-effects
var e1 = true ? 1 : foo();
var e2 = (true ? function () {} : function () {this.x = 1;})();
var e3 = (true ? () => () => {} : () => () => console.log( 'effect' ))()();
var f1 = false ? foo() : 2;
var f2 = (false ? function () {this.x = 1;} : function () {})();
var f3 = (false ? () => () => console.log( 'effect' ) : () => () => {})()();
var g = true ? 1 : 2;

// known side-effect
var h1 = true ? foo() : 2;
var h2 = (true ? function () {this.x = 1;} : function () {})();
var h3 = (true ? () => () => console.log( 'effect' ) : () => () => {})()();
var i1 = false ? 1 : foo();
var i2 = (false ? function () {} : function () {this.x = 1;})();
var i3 = (false ? () => () => {} : () => () => console.log( 'effect' ))()();
