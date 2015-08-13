import { baz } from './bar';
import * as namespace from './namespace';

assert.equal( baz, 'BAZ' );
assert.equal( namespace.baz, 'BAZ' );

export { default as foo } from './foo';
export { namespace };
