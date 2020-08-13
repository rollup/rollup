import fooModule from 'external-module';
import * as bazModule from 'external-module';
import fooCjs from 'external-cjs';
import * as bazCjs from 'external-cjs';
import fooDefault from 'external-cjs-with-default';
import * as bazDefault from 'external-cjs-with-default';
import update from 'update';

assert.deepStrictEqual(fooModule, { barModule: 'bar', default: 'foo' }, 'module');
assert.deepStrictEqual(
	bazModule,
	{ __proto__: null, default: { barModule: 'bar', default: 'foo' } },
	'module'
);
assert.deepStrictEqual(fooCjs, { barCjs: 'bar' }, 'cjs');
assert.deepStrictEqual(bazCjs, { __proto__: null, default: { barCjs: 'bar' } }, 'cjs');
assert.deepStrictEqual(fooDefault, { barDefault: 'bar', default: 'foo' }, 'default');
assert.deepStrictEqual(
	bazDefault,
	{ __proto__: null, default: { barDefault: 'bar', default: 'foo' } },
	'default'
);

update();

assert.deepStrictEqual(fooModule, { barModule: 'bar2', default: 'foo2' }, 'module');
assert.deepStrictEqual(
	bazModule,
	{ __proto__: null, default: { barModule: 'bar2', default: 'foo2' } },
	'module'
);
assert.deepStrictEqual(fooCjs, { barCjs: 'bar2' }, 'cjs');
assert.deepStrictEqual(bazCjs, { __proto__: null, default: { barCjs: 'bar2' } }, 'cjs');
assert.deepStrictEqual(fooDefault, { barDefault: 'bar2', default: 'foo2' }, 'default');
assert.deepStrictEqual(
	bazDefault,
	{ __proto__: null, default: { barDefault: 'bar2', default: 'foo2' } },
	'default'
);
