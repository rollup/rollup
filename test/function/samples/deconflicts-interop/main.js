import external1 from 'external1';
import external2 from 'external2';
import * as external3 from 'external3';

const _interopDefault = null;
const _interopDefaultLegacy = null;
const _interopNamespace = null;

assert.strictEqual( _interopDefault, null );
assert.strictEqual( _interopDefaultLegacy, null );
assert.strictEqual( _interopNamespace, null );
assert.strictEqual( external1, 1 );
assert.strictEqual( external2, 2 );
assert.deepStrictEqual( external3, {__proto__: null, default: 3} );
