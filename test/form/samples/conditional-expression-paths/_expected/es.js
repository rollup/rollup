var unknownValue = globalFunction();

// unknown branch with side-effect
var foo2 = { x: () => {} };
var bar2 = { x: () => console.log( 'effect' ) };
var a2 = (unknownValue ? foo2 : bar2).x.y.z;
var b2 = (unknownValue ? foo2 : bar2).x();
foo2.x();
bar2.x();

var bar4 = { x: () => console.log( 'effect' ) };
var a4 = (bar4).y.z;
var b4 = (bar4).y.z;
var c4 = (bar4).x();
var d4 = (bar4).x();
var e4 = (bar4).y.z = 1;
var f4 = (bar4).y.z = 1;
