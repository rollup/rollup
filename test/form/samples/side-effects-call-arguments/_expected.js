function foo () {}
foo( globalThis.unknown() );

var baz = 2;
foo( baz++ );

assert.equal(baz, 3);
