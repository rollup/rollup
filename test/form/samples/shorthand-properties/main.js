import { foo } from './foo';
import { bar } from './bar';
import { baz } from './baz';

assert.equal( foo.x(), 'foo' );
assert.equal( bar.x(), 'bar' );
assert.equal( baz.x(), 'baz' );
