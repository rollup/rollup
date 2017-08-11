import * as foo from './foo';

var bar = 'baz';

assert.equal( foo.bar, 'bar' );
assert.equal( foo.baz, 'baz' );

assert.equal( foo[ bar ], 'baz' );
