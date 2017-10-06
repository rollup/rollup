// side-effect in condition
var a = foo() ? 1 : 2;

var unknownValue = bar();

// unknown branch without side-effects
var b = unknownValue ? 1 : 2;

// unknown branch with side-effect
var c = unknownValue ? foo() : 2;
var d = unknownValue ? 1 : foo();

// no side-effects
var e = true ? 1 : foo();
var f = false ? foo() : 2;
var g = true ? 1 : 2;

// known side-effect
var h = true ? foo() : 2;
var i = false ? 1 : foo();

