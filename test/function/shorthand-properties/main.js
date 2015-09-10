import bar from './baz.js';
import { foo } from './foo';

assert.equal( bar(), 'main-bar' );
assert.equal( foo.bar(), 'foo-bar' );
