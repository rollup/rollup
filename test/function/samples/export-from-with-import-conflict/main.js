import { foo, baz } from './b';

export { foo as bar } from './a';
export { bar as foo } from './a';
export { baz } from './a';

assert.equal( foo, 'b-foo' );
assert.equal( baz, 'b-baz' );
