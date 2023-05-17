import { foo } from 'my-chunk.js';
import 'my-chunk2.js';
assert.equal(foo, 'foo');
