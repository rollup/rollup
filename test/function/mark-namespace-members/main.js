import * as foo from './foo';

var member = 'bar';
assert.equal( foo[ member ](), 42 );
