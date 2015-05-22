import foo from './foo';
import bar from './bar';

assert.equal( foo, 'foo' );
assert.equal( bar(), '../../baz/bar' );
