'use strict';

function foo () {
	return 42;
}

foo.property = "Foo";

assert.equal( foo(), 42 );
assert.equal( foo.property, "Foo" );