var foo = 'local-foo';
var baz = 'local-baz';

export { foo as bar } from './a';
export { bar as foo } from './a';
export { baz } from './a';

assert.equal( foo, 'local-foo' );
assert.equal( baz, 'local-baz' );
