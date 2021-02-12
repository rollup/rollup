// Unassigned export
var foo1;

// Reassigned uninitialised export
bar1 = 1;
var bar1;

// Reassigned initialised export
var baz1 = 1;
baz1 = 2;

// Unassigned export
var kept1, foo2, kept2;

// Reassigned uninitialised export
var kept1, bar2, kept2;
bar2 = 1;

// Reassigned initialised export
var kept1, baz2 = 1, kept2;
baz2 = 2;

console.log( kept1, kept2 );

export { bar1, bar2, baz1, baz2, foo1, foo2 };
