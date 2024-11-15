import bar from './dep.js';

const [Foo, Bar] = [1, 2];

assert.deepStrictEqual(bar, { ok: true });
assert.deepStrictEqual(Bar, 2);
