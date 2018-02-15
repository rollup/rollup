// Unassigned export
export var foo1;

// Reassigned uninitialised export
bar1 = 1;
export var bar1; // this will be removed for non ES6 bundles

// Reassigned initialised export
export var baz1 = 1;
baz1 = 2;

// Unassigned export
var kept1, foo2, kept2;

// Reassigned uninitialised export
var kept1, bar2, kept2;
bar2 = 1;

// Reassigned initialised export
var kept1, baz2 = 1, kept2;
baz2 = 2;

export { foo2, bar2, baz2 };

console.log( kept1, kept2 );
