import fooModule, { barModule } from 'external-module';
import * as bazModule from 'external-module';
import fooCjs, { barCjs } from 'external-cjs';
import * as bazCjs from 'external-cjs';
import fooDefault, { barDefault } from 'external-cjs-with-default';
import * as bazDefault from 'external-cjs-with-default';

assert.strictEqual(fooModule, 'foo', 'module');
assert.strictEqual(barModule, 'bar', 'module');
assert.deepStrictEqual(bazModule, { barModule: 'bar', default: 'foo' }, 'module');
assert.deepStrictEqual(fooCjs, { barCjs: 'bar' }, 'cjs');
assert.strictEqual(barCjs, 'bar', 'cjs');
assert.deepStrictEqual(
	bazCjs,
	{ __proto__: null, barCjs: 'bar', default: { barCjs: 'bar' } },
	'cjs'
);
assert.deepStrictEqual(fooDefault, { barDefault: 'bar', default: 'foo' }, 'default');
assert.strictEqual(barDefault, 'bar', 'default');
assert.deepStrictEqual(
	bazDefault,
	{ __proto__: null, barDefault: 'bar', default: { barDefault: 'bar', default: 'foo' } },
	'default'
);
