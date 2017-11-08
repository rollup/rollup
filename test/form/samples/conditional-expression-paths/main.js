var unknownValue = globalFunction();

// unknown branch without side-effects
var foo1 = { x: () => {} };
var bar1 = { x: () => {} };
var a1 = (unknownValue ? foo1 : bar1).x.y;
var b1 = (unknownValue ? foo1 : bar1).x();
var c1 = (unknownValue ? foo1 : bar1).x = () => {};
foo1.x();
bar1.x();

// unknown branch with side-effect
var foo2 = { x: () => {} };
var bar2 = { x: () => console.log( 'effect' ) };
var a2 = (unknownValue ? foo2 : bar2).x.y.z;
var b2 = (unknownValue ? foo2 : bar2).x();
var c2 = (unknownValue ? foo2 : bar2).x = () => console.log( 'effect' );
foo2.x();
bar2.x();

// no side-effects
var foo3 = { x: () => {}, y: {} };
var bar3 = { x: () => console.log( 'effect' ) };
var a3 = (true ? foo3 : bar3).y.z;
var b3 = (false ? bar3 : foo3).y.z;
var c3 = (true ? foo3 : bar3).x();
var d3 = (false ? bar3 : foo3).x();
var e3 = (true ? foo3 : bar3).y.z = 1;
var f3 = (false ? bar3 : foo3).y.z = 1;

// known side-effect
var foo4 = { x: () => {}, y: {} };
var bar4 = { x: () => console.log( 'effect' ) };
var a4 = (true ? bar4 : foo4).y.z;
var b4 = (false ? foo4 : bar4).y.z;
var c4 = (true ? bar4 : foo4).x();
var d4 = (false ? foo4 : bar4).x();
var e4 = (true ? bar4 : foo4).y.z = 1;
var f4 = (false ? foo4 : bar4).y.z = 1;
