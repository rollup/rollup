// side-effect in condition
var a = foo() ? 1 : 2;

var unknownValue = bar();

// unknown branch without side-effects
var b = unknownValue ? 1 : 2;
var b1 = function () {};
var b2 = function () {this.x = 1;};
new (unknownValue ? b1 : b2)();

// unknown branch with side-effect
var c = unknownValue ? foo() : 2;
var d = unknownValue ? 1 : foo();
var d1 = function () {};
var d2 = function () {this.x = 1;};
(unknownValue ? d1 : d2)();

// no side-effects
var e = true ? 1 : foo();
var e1 = (true ? function () {} : function () {this.x = 1;})();
var f = false ? foo() : 2;
var f1 = (false ? function () {this.x = 1;} : function () {})();
var g = true ? 1 : 2;

// known side-effect
var h = true ? foo() : 2;
var h1 = (true ? function () {this.x = 1;} : function () {})();
var i = false ? 1 : foo();
var i1 = (false ? function () {} : function () {this.x = 1;})();
