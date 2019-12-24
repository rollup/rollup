var unknownValue = globalThis.unknown();
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
var a3 = ( foo ).y.z;
var b3 = ( foo).y.z;
var c3 = ( foo ).x();
var d3 = ( foo).x();

// known branch with side-effect
var a4 = ( baz ).y.z;
var b4 = ( baz).y.z;
var c4 = ( baz ).x();
var d4 = ( baz).x();
var baz3 = {};
( baz3 ).y.z = 1;
( baz3).y.z = 1;
