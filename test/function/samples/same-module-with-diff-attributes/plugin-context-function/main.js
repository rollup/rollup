import { foo } from './foo.js' with { type: 'unchanged' };

assert.equal(foo, 'changed');
