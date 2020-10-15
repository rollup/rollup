import * as externalAuto from 'external-auto';
import { foo } from 'external-auto';
import * as externalDefault from 'external-default';
import { foo as foo$1 } from 'external-default';
import * as externalDefaultOnly from 'external-defaultOnly';
import externalDefaultOnly__default from 'external-defaultOnly';

assert.strictEqual(externalAuto[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(externalAuto), '[object Module]');
assert.strictEqual(foo, 42);

assert.strictEqual(externalDefault[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(externalDefault), '[object Module]');
assert.strictEqual(foo$1, 42);

assert.strictEqual(externalDefaultOnly[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(externalDefaultOnly), '[object Module]');
assert.deepStrictEqual(externalDefaultOnly__default, { foo: 42 });
