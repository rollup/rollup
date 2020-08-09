import external1 from 'external';
import * as external2 from 'external';

const _interopDefaultLegacy = null;
const _interopNamespace = null;

assert.strictEqual(_interopDefaultLegacy, null);
assert.strictEqual(_interopNamespace, null);
assert.strictEqual(external1, 'bar');
assert.deepStrictEqual(external2, { default: 'bar', foo: 'foo' });
