import fooModule, { barModule } from 'external-module';
import * as bazModule from 'external-module';
import fooCjs, { barCjs } from 'external-cjs';
import * as bazCjs from 'external-cjs';
import fooDefault, { barDefault } from 'external-cjs-with-default';
import * as bazDefault from 'external-cjs-with-default';
import update from 'update';

assert.strictEqual(fooModule, 'foo', 'module');
assert.strictEqual(barModule, 'bar', 'module');
assert.deepStrictEqual(bazModule, { barModule: 'bar', default: 'foo' }, 'module');
assert.deepStrictEqual(fooCjs, undefined, 'cjs');
assert.strictEqual(barCjs, 'bar', 'cjs');
assert.deepStrictEqual(bazCjs, { barCjs: 'bar' }, 'cjs');
assert.deepStrictEqual(fooDefault, 'foo', 'default');
assert.strictEqual(barDefault, 'bar', 'default');
assert.deepStrictEqual(bazDefault, { barDefault: 'bar', default: 'foo' }, 'default');

update();

assert.strictEqual(fooModule, 'foo2', 'module');
assert.strictEqual(barModule, 'bar2', 'module');
assert.deepStrictEqual(bazModule, { barModule: 'bar2', default: 'foo2' }, 'module');
assert.deepStrictEqual(fooCjs, undefined, 'cjs');
assert.strictEqual(barCjs, 'bar2', 'cjs');
assert.deepStrictEqual(bazCjs, { barCjs: 'bar2' }, 'cjs');
assert.deepStrictEqual(fooDefault, 'foo2', 'default');
assert.strictEqual(barDefault, 'bar2', 'default');
assert.deepStrictEqual(bazDefault, { barDefault: 'bar2', default: 'foo2' }, 'default');
