import foo from './foo';
import bar from './bar';
import { normalize } from 'path';

assert.equal( foo, 'foo' );
assert.equal( bar(), normalize('../../baz/bar') );
