function foo () {}

foo();
foo( 1 );
foo( foo() );
foo( globalValue );
foo( globalFunction() );

var bar = 1;
foo( bar++ );

var baz = 2;
foo( baz++ );

assert.equal(baz, 3);
