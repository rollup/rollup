import external1 from 'external1';
import * as external2 from 'external2';
import * as external3 from 'external3';
import * as external4 from 'external4';

const _interopDefault = null;
const _interopNamespace = null;
const _interopNamespaceDefault = null;
const _interopNamespaceDefaultOnly = null;

assert.strictEqual(_interopDefault, null);
assert.strictEqual(_interopNamespace, null);
assert.strictEqual(_interopNamespaceDefault, null);
assert.strictEqual(_interopNamespaceDefaultOnly, null);
assert.strictEqual(external1, 'bar');
assert.deepStrictEqual(external2, { default: 'bar', foo: 'foo' });
assert.deepStrictEqual(external3, {
	__proto__: null,
	default: { default: 'bar', foo: 'foo' },
	foo: 'foo'
});
assert.deepStrictEqual(external4, { __proto__: null, default: { default: 'bar', foo: 'foo' } });
