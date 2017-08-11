import foo_ from './foo.js';

var foo = foo_;
assert.equal( foo(), 42 );
