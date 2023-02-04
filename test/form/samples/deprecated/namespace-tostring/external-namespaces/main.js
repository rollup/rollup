import * as externalAuto from 'external-auto';
import * as externalDefault from 'external-default';
import * as externalDefaultOnly from 'external-defaultOnly';

assert.strictEqual(externalAuto[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(externalAuto), '[object Module]');
assert.strictEqual(externalAuto.foo, 42);

assert.strictEqual(externalDefault[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(externalDefault), '[object Module]');
assert.strictEqual(externalDefault.foo, 42);

assert.strictEqual(externalDefaultOnly[Symbol.toStringTag], 'Module');
assert.strictEqual(Object.prototype.toString.call(externalDefaultOnly), '[object Module]');
assert.deepStrictEqual(externalDefaultOnly.default, { foo: 42 });
