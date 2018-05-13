var unknownValue = globalFunction();
var foo = { x: () => {}, y: {} };
var bar = { x: () => {}, y: {} };
var baz = { x: () => console.log('effect') };

// unknown branch without side-effects
var a1 = (unknownValue ? foo : bar).y.z;
var b1 = (unknownValue ? foo : bar).x();

// unknown branch with side-effect
var a2 = (unknownValue ? foo : baz).y.z;
var b2 = (unknownValue ? foo : baz).x();

// known branch without side-effects
var a3 = (true ? foo : baz).y.z;
var b3 = (false ? baz : foo).y.z;
var c3 = (true ? foo : baz).x();
var d3 = (false ? baz : foo).x();

var foo2 = { y: {} };
var baz2 = {};
(true ? foo2 : baz).y.z = 1;
(false ? baz : foo2).y.z = 1;

// known branch with side-effect
var a4 = (true ? baz : foo).y.z;
var b4 = (false ? foo : baz).y.z;
var c4 = (true ? baz : foo).x();
var d4 = (false ? foo : baz).x();

var foo3 = { y: {} };
var baz3 = {};
(true ? baz3 : foo3).y.z = 1;
(false ? foo3 : baz3).y.z = 1;
