import foo1 from './';
import foo2 from '../';
import foo3 from '.';
import foo4 from '..';
import foo5 from './index.js';
import foo6 from '../index.js';

assert.strictEqual(foo1, '.');
assert.strictEqual(foo2, '..');
assert.strictEqual(foo3, '.');
assert.strictEqual(foo4, '..');
assert.strictEqual(foo5, './index.js');
assert.strictEqual(foo6, '../index.js');
