var unknownValue = globalThis.unknown();
var foo = { x: () => {}, y: {} };
var bar = { x: () => {}, y: {} };
var baz = { x: () => console.log('effect') };

// unknown branch without side-effects
(unknownValue ? foo : bar).y.z;
(unknownValue ? foo : bar).x();

// unknown branch with side-effect
(unknownValue ? foo : baz).y.z;
(unknownValue ? foo : baz).x();

// known branch without side-effects
(foo ).y.z;
(foo).y.z;
(foo ).x();
(foo).x();

// known branch with side-effect
(baz ).y.z;
(baz).y.z;
(baz ).x();
(baz).x();
var baz3 = {};
(baz3 ).y.z = 1;
(baz3).y.z = 1;
