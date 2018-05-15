var unknownValue = globalFunction();
var foo = { x: () => {}, y: {} };
var baz = { x: () => console.log('effect') };

// unknown branch with side-effect
var a2 = (unknownValue ? foo : baz).y.z;
var b2 = (unknownValue ? foo : baz).x();

// known branch with side-effect
var a4 = (baz).y.z;
var b4 = (baz).y.z;
var c4 = (baz).x();
var d4 = (baz).x();
var baz3 = {};
(baz3).y.z = 1;
(baz3).y.z = 1;
