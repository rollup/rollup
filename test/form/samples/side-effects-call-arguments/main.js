function foo () {}

foo();
foo( 1 );
foo( foo() );
foo( globalThis.unknown );
foo( globalThis.unknown() );

var bar = 1;
foo( bar++ );

var baz = 2;
foo( baz++ );

assert.equal(baz, 3);
